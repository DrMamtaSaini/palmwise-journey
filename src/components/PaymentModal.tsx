
import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-palm-purple">
            Premium Feature
          </DialogTitle>
          <DialogDescription className="text-center">
            This feature is available for premium users only.
          </DialogDescription>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-amber-800 font-semibold mb-2">Premium Palm Reading Report</h3>
            <p className="text-amber-700 text-sm">
              Unlock detailed insights about your career, relationships, health, wealth, and more with our premium palm reading report.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link 
              to="/signup" 
              className="w-full bg-palm-purple text-white py-2 px-4 rounded-md text-center block hover:bg-palm-purple/90 transition-colors"
              onClick={onClose}
            >
              Sign Up
            </Link>
            
            <Link 
              to="/login" 
              className="w-full border border-palm-purple/30 text-palm-purple py-2 px-4 rounded-md text-center block hover:bg-palm-purple/5 transition-colors"
              onClick={onClose}
            >
              Login
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Access all premium features with a subscription plan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
