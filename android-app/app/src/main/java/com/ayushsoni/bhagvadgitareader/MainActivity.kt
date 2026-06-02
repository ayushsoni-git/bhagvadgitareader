package com.ayushsoni.bhagvadgitareader

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.print.PrintAttributes
import android.print.PrintManager
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.ayushsoni.bhagvadgitareader.theme.BhagavadGitaReaderTheme
import java.util.Calendar
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var webView: WebView? = null
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize Native Text-To-Speech engine
        tts = TextToSpeech(this, this)

        // Create notification channel if Android 8.0+
        createNotificationChannel()

        // Intercept system back press gestures to safely navigate browser history & drawers
        val onBackPressedCallback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val view = webView ?: return
                
                // Evaluate JavaScript to check if a web-level modal or drawer is open and can be closed
                view.evaluateJavascript("(function() { " +
                        "if (typeof handleBackButton === 'function') { return handleBackButton(); } " +
                        "return false; " +
                        "})()") { result ->
                    if (result == "true") {
                        // JavaScript handled it by closing an open drawer/modal! Do nothing natively.
                    } else {
                        // No drawer or modal was open. Fallback to normal navigation or exit.
                        val currentUrl = view.url ?: ""
                        if (view.canGoBack() && currentUrl.contains("#chapter=")) {
                            view.goBack()
                        } else {
                            // Otherwise, allow default exit app behavior
                            isEnabled = false
                            onBackPressedDispatcher.onBackPressed()
                            isEnabled = true
                        }
                    }
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, onBackPressedCallback)

        setContent {
            BhagavadGitaReaderTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    GitaWebView(
                        onWebViewCreated = { view ->
                            webView = view
                            // Register the custom Java-to-JS Bridge
                            view.addJavascriptInterface(GitaBridge(), "AndroidBridge")
                        }
                    )
                }
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            // Attempt to set locale to Hindi/Sanskrit
            val result = tts?.setLanguage(Locale("hi", "IN"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                // Fallback to default
                tts?.setLanguage(Locale.getDefault())
                Log.e("GitaTTS", "Hindi/Sanskrit language package not supported. Falling back to default.")
            } else {
                isTtsReady = true
                Log.d("GitaTTS", "TextToSpeech successfully initialized for Hindi/Sanskrit.")
                
                // Notify JavaScript when speech recitation completes or fails
                tts?.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        Log.d("GitaTTS", "Started speaking: $utteranceId")
                    }

                    override fun onDone(utteranceId: String?) {
                        Log.d("GitaTTS", "Speech finished: $utteranceId")
                        runOnUiThread {
                            webView?.evaluateJavascript("if (typeof onSpeechFinished === 'function') { onSpeechFinished(); }", null)
                        }
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) {
                        Log.e("GitaTTS", "Speech error: $utteranceId")
                        runOnUiThread {
                            webView?.evaluateJavascript("if (typeof onSpeechFinished === 'function') { onSpeechFinished(); }", null)
                        }
                    }

                    override fun onError(utteranceId: String?, errorCode: Int) {
                        Log.e("GitaTTS", "Speech error: $utteranceId, code: $errorCode")
                        runOnUiThread {
                            webView?.evaluateJavascript("if (typeof onSpeechFinished === 'function') { onSpeechFinished(); }", null)
                        }
                    }
                })
            }
        } else {
            Log.e("GitaTTS", "TextToSpeech initialization failed.")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Daily Contemplation Channel"
            val descriptionText = "Gita daily inspirational quote notifications"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel("gita_daily_contemplation", name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        // Shutdown TTS resources gracefully
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }

    // High-fidelity JavascriptInterface Bridge
    inner class GitaBridge {

        @JavascriptInterface
        fun syncQuote(shloka: String, translation: String, ref: String) {
            // Save active daily quote to SharedPreferences for AppWidget to access
            val sharedPref = getSharedPreferences("gita_widget_prefs", Context.MODE_PRIVATE)
            with(sharedPref.edit()) {
                putString("shloka", shloka)
                putString("translation", translation)
                putString("reference", ref)
                apply()
            }

            // Force widget refresh
            val intent = Intent(this@MainActivity, GitaAppWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            val ids = AppWidgetManager.getInstance(application)
                .getAppWidgetIds(ComponentName(application, GitaAppWidgetProvider::class.java))
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            sendBroadcast(intent)
            Log.d("GitaBridge", "Synced quote to SharedPreferences & broadcasted update: $ref")
        }

        @JavascriptInterface
        fun scheduleDailyReminder(enabled: Boolean, timeString: String) {
            // Check for notifications permission on Android 13+
            if (enabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(
                        this@MainActivity,
                        Manifest.permission.POST_NOTIFICATIONS
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    ActivityCompat.requestPermissions(
                        this@MainActivity,
                        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                        101
                    )
                }
            }

            val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(this@MainActivity, GitaNotificationReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                this@MainActivity,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (!enabled) {
                alarmManager.cancel(pendingIntent)
                Log.d("GitaBridge", "Cancelled daily notifications alarm.")
                return
            }

            // Parse time string e.g. "06:30"
            try {
                val parts = timeString.split(":")
                val hour = parts[0].toInt()
                val minute = parts[1].toInt()

                val calendar = Calendar.getInstance().apply {
                    timeInMillis = System.currentTimeMillis()
                    set(Calendar.HOUR_OF_DAY, hour)
                    set(Calendar.MINUTE, minute)
                    set(Calendar.SECOND, 0)
                }

                // If scheduled time is in the past, schedule for tomorrow
                if (calendar.timeInMillis <= System.currentTimeMillis()) {
                    calendar.add(Calendar.DAY_OF_YEAR, 1)
                }

                // Schedule recurring alarm (battery-optimized repeating alarm)
                alarmManager.setRepeating(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    AlarmManager.INTERVAL_DAY,
                    pendingIntent
                )
                Log.d("GitaBridge", "Scheduled recurring daily alarm at $timeString")
            } catch (e: Exception) {
                Log.e("GitaBridge", "Failed to parse time string or schedule alarm", e)
            }
        }

        @JavascriptInterface
        fun speakSanskrit(text: String) {
            if (isTtsReady) {
                // Speak Sanskrit shloka with direct QUEUE_FLUSH mode
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "sanskrit_speech")
                Log.d("GitaBridge", "Reciting text: $text")
            } else {
                Log.e("GitaBridge", "TTS is not ready to speak.")
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            tts?.stop()
            Log.d("GitaBridge", "Stopped speech recitation.")
        }

        @JavascriptInterface
        fun savePDF(htmlContent: String) {
            // Use Android PrintManager to open the system Save-to-PDF / Print dialog
            runOnUiThread {
                try {
                    // Create a temporary WebView to render the HTML for printing
                    val printWebView = WebView(this@MainActivity)
                    printWebView.settings.javaScriptEnabled = true

                    printWebView.webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            // Trigger the system print dialog once rendering is complete
                            val printManager = getSystemService(Context.PRINT_SERVICE) as PrintManager
                            val jobName = "Spiritual Diary - Bhagavad Gita"
                            val printAdapter = printWebView.createPrintDocumentAdapter(jobName)
                            val printAttributes = PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .setResolution(PrintAttributes.Resolution("pdf", "pdf", 600, 600))
                                .setMinMargins(PrintAttributes.Margins(5080, 5080, 5080, 5080)) // ~2cm
                                .build()
                            printManager.print(jobName, printAdapter, printAttributes)
                            Log.d("GitaBridge", "Opened system print/save-PDF dialog")

                            // Notify JS that the dialog was triggered
                            webView?.evaluateJavascript(
                                "if (typeof onPDFDialogOpened === 'function') { onPDFDialogOpened(); }",
                                null
                            )
                        }
                    }

                    printWebView.loadDataWithBaseURL(
                        null,
                        htmlContent,
                        "text/html",
                        "UTF-8",
                        null
                    )
                } catch (e: Exception) {
                    Log.e("GitaBridge", "PDF save failed", e)
                    webView?.evaluateJavascript(
                        "showToast('PDF export failed. Please try again.', 'info');",
                        null
                    )
                }
            }
        }
    }
}

@Composable
fun GitaWebView(onWebViewCreated: (WebView) -> Unit) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                // Load pages in internal WebView rather than launching external browser
                webViewClient = WebViewClient()

                // Essential configuration for offline web apps & localStorage
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true

                loadUrl("file:///android_asset/index.html")
                onWebViewCreated(this)
            }
        },
        modifier = Modifier
            .fillMaxSize()
            .navigationBarsPadding()
    )
}
