package com.myfinanceapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService

class ReminderBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return

    if (
      Intent.ACTION_BOOT_COMPLETED == action ||
      Intent.ACTION_MY_PACKAGE_REPLACED == action
    ) {
      // Start the headless JS service to reschedule the daily reminder
      val serviceIntent = Intent(context, ReminderRescheduleService::class.java)
      context.startService(serviceIntent)
      HeadlessJsTaskService.acquireWakeLockNow(context)
    }
  }
}