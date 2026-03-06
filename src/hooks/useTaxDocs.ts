import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Branch, DocType, LegalDocument } from '../types';

export const useTaxDocs = (branch: Branch, types: DocType[], searchQuery: string = '') => {
  return useQuery({
    queryKey: ['legal-docs', branch, types, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('legal_documents')
        .select('*')
        .eq('branch', branch)
        .in('type', types)
        .order('year', { ascending: false });

      if (searchQuery) {
        // Simple search logic - for production consider Supabase full-text search index
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LegalDocument[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });
};
