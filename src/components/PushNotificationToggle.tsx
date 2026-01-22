import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTheme } from '@/contexts/ThemeContext';

interface PushNotificationToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PushNotificationToggle({ 
  showLabel = true, 
  size = 'md' 
}: PushNotificationToggleProps) {
  const { isCelestial } = useTheme();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission, 
    toggle 
  } = usePushNotifications();

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  // If permission was denied, show a button to open settings
  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3">
        {showLabel && (
          <div className="space-y-1">
            <div className="font-medium text-sm">Push Notifications</div>
            <div className="text-xs opacity-60">
              Notifications are blocked. Please enable them in your browser settings.
            </div>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled
          className="opacity-50"
        >
          <BellOff className={iconSize} />
          <span className="ml-2">Blocked</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      {showLabel && (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCelestial 
              ? 'bg-purple-900/50 text-purple-300' 
              : 'bg-primary/10 text-primary'
          }`}>
            {isSubscribed ? (
              <Bell className={iconSize} />
            ) : (
              <BellOff className={iconSize} />
            )}
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">Push Notifications</div>
            <div className="text-xs opacity-60">
              {isSubscribed 
                ? 'You will receive reminders about your cycle'
                : 'Enable to get period and fertility reminders'
              }
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin opacity-50`} />
      ) : (
        <Switch
          checked={isSubscribed}
          onCheckedChange={toggle}
          aria-label="Toggle push notifications"
        />
      )}
    </div>
  );
}
