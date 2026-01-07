package com.myfinanceapp

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class ReminderRescheduleService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    return HeadlessJsTaskConfig(
      "ReminderRescheduleTask",
      Arguments.createMap(),
      60 * 1000, // 60 seconds timeout
      true // Allow task in foreground
    )
  }
}