package com.ayushsoni.bhagvadgitareader

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat

class GitaNotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Setup pending intent to launch MainActivity
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Fetch current active quote details for dynamic message context
        val sharedPref = context.getSharedPreferences("gita_widget_prefs", Context.MODE_PRIVATE)
        val translation = sharedPref.getString("translation", "Perform your prescribed duty, for action is better than inaction.") ?: "Perform your prescribed duty, for action is better than inaction."
        val reference = sharedPref.getString("reference", "Chapter 2, Verse 47") ?: "Chapter 2, Verse 47"

        val builder = NotificationCompat.Builder(context, "gita_daily_contemplation")
            .setSmallIcon(android.R.drawable.star_on) // Standard clean star/favourite icon
            .setContentTitle("Daily Gita Wisdom")
            .setContentText("\"$translation\" — $reference")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("\"$translation\"\n\n— $reference")
            )
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        notificationManager.notify(1001, builder.build())
    }
}
