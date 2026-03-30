export interface SupplierBuyer {
  id: string;
  employee_id: string;
  name: string;
  type: 'supplier' | 'buyer';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  supplier_buyer_id: string;
  employee_id: string;
  visit_date: string;
  latitude?: number;
  longitude?: number;
  purpose?: string;
  notes?: string;
  document_url?: string;
  created_at: string;
}

export interface VisitDocument {
  id: string;
  visit_id: string;
  document_url: string;
  document_type: string;
  created_at: string;
}

export interface CreateSupplierBuyerDTO {
  name: string;
  type: 'supplier' | 'buyer';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
}

export interface UpdateSupplierBuyerDTO {
  name?: string;
  type?: 'supplier' | 'buyer';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
}

export interface CreateVisitDTO {
  visit_date: string;
  latitude?: number;
  longitude?: number;
  purpose?: string;
  notes?: string;
  document_url?: string;
}

export interface VisitHistoryEntry {
  id: string;
  visit_date: string;
  purpose?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  document_url?: string;
  created_at: string;
}
