import { LocalDatabase } from './db';
import { CallLogItem } from '../types';
import { soundEngine } from './audio';

export interface IncomingCallSimulationResult {
  allowedToRing: boolean;
  smsSent: boolean;
  actionTaken: CallLogItem['actionTaken'];
  reasonText: string;
  messageText: string;
  callerName: string;
  callerNumber: string;
  cooldownRemainingMinutes?: number;
}

export function processIncomingCall(
  callerNumber: string,
  callerName?: string
): IncomingCallSimulationResult {
  const settings = LocalDatabase.getSettings();
  const modes = LocalDatabase.getModes();
  const contacts = LocalDatabase.getContacts();
  const logs = LocalDatabase.getCallLogs();

  const activeMode = modes.find((m) => m.id === settings.activeModeId) || modes[0];
  const contact = contacts.find(
    (c) =>
      c.phone.replace(/[\s-]/g, '') === callerNumber.replace(/[\s-]/g, '') ||
      (callerName && c.name.toLowerCase() === callerName.toLowerCase())
  );

  const displayName = callerName || contact?.name || 'Unknown Caller';

  // If BusyMate is globally turned OFF
  if (!settings.isGlobalActive) {
    LocalDatabase.addCallLog({
      callerName: displayName,
      callerNumber,
      modeActiveWhenReceived: 'Disabled (Off)',
      actionTaken: 'manual_declined',
      replyMessageSent: undefined,
      simSlot: 1,
    });
    return {
      allowedToRing: true,
      smsSent: false,
      actionTaken: 'manual_declined',
      reasonText: 'BusyMate is currently turned OFF. Incoming calls ring normally.',
      messageText: '',
      callerName: displayName,
      callerNumber,
    };
  }

  // 1. Check for Emergency contact with Repeated Calls Bypass
  if (contact?.type === 'emergency' && contact.allowRepeatedCallsBypass) {
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    const recentRings = logs.filter(
      (l) =>
        (l.callerNumber === callerNumber || l.callerName === displayName) &&
        l.timestamp >= threeMinutesAgo
    );

    if (recentRings.length >= 1) {
      // Caller has called twice within 3 minutes - Emergency breakthrough!
      LocalDatabase.addCallLog({
        callerName: displayName,
        callerNumber,
        modeActiveWhenReceived: activeMode.title,
        actionTaken: 'emergency_bypassed',
        replyMessageSent: undefined,
        simSlot: 1,
      });

      return {
        allowedToRing: true,
        smsSent: false,
        actionTaken: 'emergency_bypassed',
        reasonText: `Emergency Bypass: ${displayName} called repeatedly within 3 minutes. Ringing phone!`,
        messageText: '',
        callerName: displayName,
        callerNumber,
      };
    }
  }

  // 2. Check Excluded contacts (never send auto-reply to them)
  if (contact?.type === 'excluded') {
    LocalDatabase.addCallLog({
      callerName: displayName,
      callerNumber,
      modeActiveWhenReceived: activeMode.title,
      actionTaken: 'excluded_contact',
      replyMessageSent: undefined,
      simSlot: 1,
    });

    return {
      allowedToRing: !activeMode.silenceCalls,
      smsSent: false,
      actionTaken: 'excluded_contact',
      reasonText: `${displayName} is in your Excluded Contacts list. Auto-reply suppressed.`,
      messageText: '',
      callerName: displayName,
      callerNumber,
    };
  }

  // Determine what message to send
  let messageToSend = activeMode.activeMessage || activeMode.defaultMessage;
  if (contact?.customMessage && contact.customMessage.trim().length > 0) {
    messageToSend = contact.customMessage;
  }

  // 3. Duplicate Message Prevention (Cooldown Check)
  const cooldownMs = settings.cooldownPeriodMinutes * 60 * 1000;
  const cutoffTime = Date.now() - cooldownMs;

  const lastSms = logs.find(
    (l) =>
      (l.callerNumber === callerNumber || (displayName !== 'Unknown Caller' && l.callerName === displayName)) &&
      l.actionTaken === 'sms_sent' &&
      l.timestamp >= cutoffTime
  );

  if (lastSms) {
    const elapsedMinutes = Math.floor((Date.now() - lastSms.timestamp) / 60000);
    const remainingMinutes = settings.cooldownPeriodMinutes - elapsedMinutes;

    LocalDatabase.addCallLog({
      callerName: displayName,
      callerNumber,
      modeActiveWhenReceived: activeMode.title,
      actionTaken: 'cooldown_skipped',
      replyMessageSent: undefined,
      simSlot: 1,
    });

    return {
      allowedToRing: !activeMode.silenceCalls,
      smsSent: false,
      actionTaken: 'cooldown_skipped',
      reasonText: `Duplicate protection active: Already replied to this number ${elapsedMinutes}m ago. Cooldown remaining: ${remainingMinutes}m.`,
      messageText: messageToSend,
      callerName: displayName,
      callerNumber,
      cooldownRemainingMinutes: remainingMinutes,
    };
  }

  // 4. Check if SMS is permitted and enabled
  const canSendSms =
    settings.autoSmsGloballyEnabled &&
    activeMode.isAutoSmsEnabled &&
    settings.permissions.sendSms;

  if (canSendSms) {
    if (settings.soundAlertsEnabled) {
      soundEngine.playSmsSentChime();
    }

    LocalDatabase.addCallLog({
      callerName: displayName,
      callerNumber,
      modeActiveWhenReceived: activeMode.title,
      actionTaken: 'sms_sent',
      replyMessageSent: messageToSend,
      simSlot: settings.dualSimPreference === 'sim2' ? 2 : 1,
    });

    return {
      allowedToRing: !activeMode.silenceCalls,
      smsSent: true,
      actionTaken: 'sms_sent',
      reasonText: `Auto-reply SMS dispatched via SIM ${settings.dualSimPreference === 'sim2' ? '2' : '1'}.`,
      messageText: messageToSend,
      callerName: displayName,
      callerNumber,
    };
  } else {
    LocalDatabase.addCallLog({
      callerName: displayName,
      callerNumber,
      modeActiveWhenReceived: activeMode.title,
      actionTaken: 'sms_failed',
      replyMessageSent: undefined,
      simSlot: 1,
    });

    return {
      allowedToRing: !activeMode.silenceCalls,
      smsSent: false,
      actionTaken: 'sms_failed',
      reasonText: !settings.permissions.sendSms
        ? 'SEND_SMS permission not granted in Android Settings.'
        : 'Auto-reply SMS is disabled in Settings or Mode config.',
      messageText: messageToSend,
      callerName: displayName,
      callerNumber,
    };
  }
}
