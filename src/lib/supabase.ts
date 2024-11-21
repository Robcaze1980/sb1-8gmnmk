import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SaleEntry {
  id: string;
  user_id: string;
  stock_number: string;
  customer_name: string;
  sale_type: 'New' | 'Used' | 'Trade-In';
  sale_price: number;
  accessories_price?: number;
  warranty_price?: number;
  warranty_cost?: number;
  maintenance_price?: number;
  maintenance_cost?: number;
  shared_with_email?: string;
  shared_with_id?: string;
  shared_status?: 'pending' | 'accepted' | 'rejected';
  date: string;
}

export interface SpiffEntry {
  id: string;
  user_id: string;
  amount: number;
  note?: string;
  image_url?: string;
  date: string;
}

export interface SharedSaleNotification {
  id: string;
  sale_id: string;
  recipient_id: string;
  sender_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export async function getUserIdFromEmail(email: string): Promise<string | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      const { data: authData, error: authError } = await supabase.rpc('get_user_id_from_email', {
        email_address: email
      });

      if (authError) throw authError;
      return authData || null;
    }

    return userData?.id || null;
  } catch (error) {
    console.error('Error getting user ID from email:', error);
    return null;
  }
}

export function calculateCommissions(sale: SaleEntry) {
  let carCommission = 0;
  let accessoriesCommission = 0;
  let warrantyCommission = 0;
  let maintenanceCommission = 0;

  // Car commission based on sale price
  if (sale.sale_price < 10000) {
    carCommission = 200;
  } else if (sale.sale_price < 20000) {
    carCommission = 300;
  } else if (sale.sale_price < 30000) {
    carCommission = 400;
  } else {
    carCommission = 500;
  }

  // Accessories commission
  if (sale.accessories_price) {
    const threshold = sale.sale_type === 'New' ? 988 : 488;
    const eligibleAmount = sale.accessories_price - threshold;
    if (eligibleAmount > 800) {
      accessoriesCommission = 100;
    }
  }

  // Warranty commission
  if (sale.warranty_price && sale.warranty_cost) {
    const profit = sale.warranty_price - sale.warranty_cost;
    warrantyCommission = Math.floor(profit / 1000) * 100;
  }

  // Maintenance commission
  if (sale.maintenance_price && sale.maintenance_price > 800) {
    maintenanceCommission = 100;
  }

  const totalCommission = carCommission + accessoriesCommission + warrantyCommission + maintenanceCommission;

  return {
    carCommission,
    accessoriesCommission,
    warrantyCommission,
    maintenanceCommission,
    totalCommission,
  };
}

export async function shareSale(saleId: string, recipientEmail: string) {
  try {
    // First, get the recipient's user ID
    const { data: recipientData, error: recipientError } = await supabase
      .from('users')
      .select('id')
      .eq('email', recipientEmail)
      .single();

    if (recipientError || !recipientData) {
      throw new Error('Recipient not found');
    }

    // Update the sale with shared information
    const { error: saleError } = await supabase
      .from('sales')
      .update({
        shared_with_email: recipientEmail,
        shared_with_id: recipientData.id,
        shared_status: 'pending'
      })
      .eq('id', saleId);

    if (saleError) throw saleError;

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientData.id,
        sale_id: saleId,
        type: 'shared_sale_pending'
      });

    if (notificationError) throw notificationError;

    return { success: true };
  } catch (error) {
    console.error('Error sharing sale:', error);
    throw error;
  }
}

export async function respondToSharedSale(saleId: string, response: 'accepted' | 'rejected') {
  try {
    const { error: saleError } = await supabase
      .from('sales')
      .update({ shared_status: response })
      .eq('id', saleId);

    if (saleError) throw saleError;

    return { success: true };
  } catch (error) {
    console.error('Error responding to shared sale:', error);
    throw error;
  }
}

export async function getSharedSaleNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sales (
          id,
          stock_number,
          customer_name,
          sale_type,
          sale_price,
          date
        )
      `)
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}