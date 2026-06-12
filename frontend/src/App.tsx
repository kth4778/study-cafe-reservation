import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { EntryPage } from '@/pages/EntryPage';
import { KioskShell } from '@/components/kiosk/KioskShell';
import { AdminShell } from '@/components/admin/AdminShell';
import { KioskHomePage } from '@/pages/kiosk/KioskHomePage';
import { SeatSelectPage } from '@/pages/kiosk/SeatSelectPage';
import { PaymentPage } from '@/pages/kiosk/PaymentPage';
import { LoadingPage } from '@/pages/kiosk/LoadingPage';
import { UsageStatusPage } from '@/pages/kiosk/UsageStatusPage';
import { TimeExtendPage } from '@/pages/kiosk/TimeExtendPage';
import { CheckOutPage } from '@/pages/kiosk/CheckOutPage';
import { CheckOutCompletePage } from '@/pages/kiosk/CheckOutCompletePage';
import { PaymentCompletePage } from '@/pages/kiosk/PaymentCompletePage';
import { CustomerServicePage } from '@/pages/kiosk/CustomerServicePage';
import { ReceiptPage } from '@/pages/kiosk/ReceiptPage';
import { KioskNoticesPage } from '@/pages/kiosk/KioskNoticesPage';
import { SeatLookupPage } from '@/pages/kiosk/SeatLookupPage';
import { SeatTransferPage } from '@/pages/kiosk/SeatTransferPage';

import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { RecordsPage } from '@/pages/admin/RecordsPage';
import { StatsPage } from '@/pages/admin/StatsPage';
import { NoticePage } from '@/pages/admin/NoticePage';
import { ErrorLogPage } from '@/pages/admin/ErrorLogPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';
import { AuthGuard } from '@/components/admin/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
        }}
      />
      <Routes>
        {/* 모드 선택 (직접 접근 시 키오스크로) */}
        <Route path="/" element={<Navigate to="/kiosk" replace />} />
        <Route path="/entry" element={<EntryPage />} />

        {/* 키오스크 — KioskShell 프레임 */}
        <Route path="/kiosk" element={<KioskShell />}>
          <Route index element={<KioskHomePage />} />
          <Route path="seats" element={<SeatSelectPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="loading" element={<LoadingPage />} />
          <Route path="usage" element={<UsageStatusPage />} />
          <Route path="extend" element={<TimeExtendPage />} />
          <Route path="checkout" element={<CheckOutPage />} />
          <Route path="checkout-complete" element={<CheckOutCompletePage />} />
          <Route path="payment-complete" element={<PaymentCompletePage />} />
          <Route path="support" element={<CustomerServicePage />} />
          <Route path="receipt" element={<ReceiptPage />} />
          <Route path="notices" element={<KioskNoticesPage />} />
          <Route path="lookup" element={<SeatLookupPage />} />
          <Route path="transfer" element={<SeatTransferPage />} />
        </Route>

        {/* 관리자 — AdminShell(모니터 프레임) 안 */}
        <Route path="/admin" element={<AdminShell />}>
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path="records" element={<AuthGuard><RecordsPage /></AuthGuard>} />
          <Route path="stats" element={<AuthGuard><StatsPage /></AuthGuard>} />
          <Route path="notices" element={<AuthGuard><NoticePage /></AuthGuard>} />
          <Route path="logs" element={<AuthGuard><ErrorLogPage /></AuthGuard>} />
          <Route path="settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
        </Route>

        <Route path="*" element={<Navigate to="/kiosk" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
