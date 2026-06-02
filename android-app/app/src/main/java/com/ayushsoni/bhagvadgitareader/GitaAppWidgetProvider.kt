package com.ayushsoni.bhagvadgitareader

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class GitaAppWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val sharedPref = context.getSharedPreferences("gita_widget_prefs", Context.MODE_PRIVATE)
        val shloka = sharedPref.getString(
            "shloka",
            "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"
        ) ?: ""
        val translation = sharedPref.getString(
            "translation",
            "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."
        ) ?: ""
        val reference = sharedPref.getString("reference", "Chapter 2, Verse 47") ?: ""

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.gita_widget)
            views.setTextViewText(R.id.widget_shloka, shloka)
            views.setTextViewText(R.id.widget_translation, translation)
            views.setTextViewText(R.id.widget_reference, reference)

            // Open app on widget background click
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
