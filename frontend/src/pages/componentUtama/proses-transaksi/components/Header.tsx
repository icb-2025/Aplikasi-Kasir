import { CreditCard, QrCode, Smartphone, Wallet } from "lucide-react";

interface HeaderProps {
  onClose: () => void;
  paymentType: 'va' | 'qris' | 'ewallet' | 'tunai' | null;
  metodePembayaran?: string;
}

const getPaymentMethodIcon = (paymentType: 'va' | 'qris' | 'ewallet' | 'tunai' | null) => {
  switch (paymentType) {
    case 'va':
      return <CreditCard className="w-5 h-5" />;
    case 'qris':
      return <QrCode className="w-5 h-5" />;
    case 'ewallet':
      return <Smartphone className="w-5 h-5" />;
    case 'tunai':
      return <Wallet className="w-5 h-5" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
};

const getPaymentMethodName = (paymentType: 'va' | 'qris' | 'ewallet' | 'tunai' | null, metodePembayaran?: string) => {
  switch (paymentType) {
    case 'va':
      return 'Virtual Account';
    case 'qris':
      return 'QRIS';
    case 'ewallet':
      return 'E-Wallet';
    case 'tunai':
      return 'Tunai';
    default:
      return metodePembayaran || 'Metode Pembayaran';
  }
};

const Header: React.FC<HeaderProps> = ({paymentType, metodePembayaran }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            {getPaymentMethodIcon(paymentType)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Proses Pembayaran</h1>
            <p className="text-blue-100 text-sm">{getPaymentMethodName(paymentType, metodePembayaran)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;