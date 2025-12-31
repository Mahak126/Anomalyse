import React from 'react';
import { QuickAction } from '../../chatbotTypes';
import { LockIcon, PhoneIcon, EyeIcon, ShieldIcon } from './Icons';

interface QuickActionsProps {
  onActionClick: (prompt: string) => void;
  disabled: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, disabled }) => {
  const actions: QuickAction[] = [
    {
      id: 'freeze',
      label: 'Freeze Card',
      prompt: 'I want to freeze my card.',
      icon: <LockIcon className="w-4 h-4" />
    },
    {
      id: 'transactions',
      label: 'Check Transactions',
      prompt: 'I want to check my transactions.',
      icon: <EyeIcon className="w-4 h-4" />
    },
    {
      id: 'contact',
      label: 'Contact Bank',
      prompt: 'I want to contact the bank.',
      icon: <PhoneIcon className="w-4 h-4" />
    },
     {
      id: 'passwords',
      label: 'Secure Account',
      prompt: 'How do I change my password?',
      icon: <ShieldIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-0 md:flex-wrap md:justify-center">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick?.(action.prompt)}
          disabled={disabled}
          className="flex items-center gap-2 whitespace-nowrap bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;