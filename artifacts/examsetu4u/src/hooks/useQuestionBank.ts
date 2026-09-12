import { useCallback, useEffect, useState } from 'react';
import {
  fetchGoogleSheetQuestions,
  getEffectiveSheetUrl,
  getGoogleSheetReport,
  getPublishedGoogleSheetQuestions,
  isSheetConfigured,
  refreshGoogleSheetQuestions,
  subscribeToQuestionBank,
} from '@/services/google-sheet-loader';
import type { GoogleSheetBankReport } from '@/types/google-sheet';

export interface UseQuestionBankResult {
  report: GoogleSheetBankReport | null;
  status: GoogleSheetBankReport['status'];
  statusMessage: string;
  isLoading: boolean;
  isConfigured: boolean;
  publishedSheetCount: number;
  totalRows: number;
  activeUrl: string;
  refresh: () => Promise<GoogleSheetBankReport>;
}

export function useQuestionBank(): UseQuestionBankResult {
  const [report, setReport] = useState<GoogleSheetBankReport | null>(() => getGoogleSheetReport());
  const activeUrl = getEffectiveSheetUrl();
  const isConfigured = isSheetConfigured(activeUrl);

  useEffect(() => {
    // Subscribe to bank updates
    const unsubscribe = subscribeToQuestionBank((updatedReport) => {
      setReport(updatedReport);
    });

    // If report is not loaded yet and it's configured, kick off initial load
    if (isConfigured) {
      const currentReport = getGoogleSheetReport();
      if (!currentReport) {
        fetchGoogleSheetQuestions().catch((err) => {
          console.warn('[useQuestionBank] Initial fetch error:', err);
        });
      }
    }

    return () => {
      unsubscribe();
    };
  }, [isConfigured]);

  const handleRefresh = useCallback(async () => {
    return refreshGoogleSheetQuestions();
  }, []);

  const isLoading = report?.status === 'loading';
  const status = report?.status || (isConfigured ? 'unconfigured' : 'unconfigured');
  const statusMessage = report?.statusMessage || (isConfigured ? 'Ready to fetch' : 'Not configured');
  const publishedSheetCount = report?.publishedCount ?? getPublishedGoogleSheetQuestions().length;
  const totalRows = report?.totalRows ?? 0;

  return {
    report,
    status,
    statusMessage,
    isLoading,
    isConfigured,
    publishedSheetCount,
    totalRows,
    activeUrl,
    refresh: handleRefresh,
  };
}
