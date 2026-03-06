export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export type Branch = 'Income Tax' | 'VAT' | 'Customs';
export type DocType = 'ACT' | 'SRO' | 'GO' | 'SO' | 'Circular';

export interface LegalDocument {
  id: string;
  title: string;
  branch: Branch;
  type: DocType;
  year: number;
  content: string;
  section_reference: string | null;
  effective_date: string | null;
  is_latest: boolean;
  created_at: string;
  updated_at: string;
}

export type HierarchyCategory = 'Primary Laws' | 'Delegated' | 'Administrative';

export const DOC_TYPE_MAPPING: Record<HierarchyCategory, DocType[]> = {
  'Primary Laws': ['ACT'],
  'Delegated': ['SRO'],
  'Administrative': ['GO', 'SO', 'Circular']
};
