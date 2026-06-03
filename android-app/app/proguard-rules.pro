# ============================================================
# Bhagavad Gita Reader — ProGuard / R8 Rules (v1.1.0)
# ============================================================

# --- Kotlin ---
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings { <fields>; }
-keepclassmembers class kotlin.Lazy { *; }

# --- Kotlin Serialization ---
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class * {
    @kotlinx.serialization.Serializable <methods>;
}

# --- Jetpack Compose ---
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**
-keepclassmembers class * {
    @androidx.compose.runtime.Composable <methods>;
}

# --- Navigation3 ---
-keep class androidx.navigation3.** { *; }

# --- App entry points ---
-keep class com.ayushsoni.bhagvadgitareader.** { *; }

# --- Android basics ---
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# --- WebView JavaScript interfaces ---
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# --- Parcelable ---
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# --- Suppress warnings for known benign missing refs ---
-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**
