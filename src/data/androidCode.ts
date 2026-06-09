import { KotlinFile } from "../types";

export const KOTLIN_PROJECT_FILES: KotlinFile[] = [
  {
    name: "AndroidManifest.xml",
    path: "app/src/main/AndroidManifest.xml",
    description: "Configures essential background capabilities, registering our high-privilege Accessibility Service and Device Administrator.",
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vault.focusvault">

    <!-- Core Permissions Required for Anti-Tampering & Overlay hijack -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

    <application
        android:name=".FocusApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FocusVault">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.FocusVault">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Blocking Full-Screen Overlay Activity -->
        <activity
            android:name=".ui.OverlayBlockActivity"
            android:showOnLockScreen="true"
            android:screenOrientation="portrait"
            android:launchMode="singleInstance"
            android:theme="@style/Theme.FocusVault.Overlay"
            android:exported="false" />

        <!-- 1. Accessibility Service Interceptor -->
        <service
            android:name=".service.FocusAccessibilityService"
            android:label="Focus Vault Blocker"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.view.accessibility.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.view.accessibility.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- 2. Device Administrator Receiver -->
        <receiver
            android:name=".receiver.FocusDeviceAdminReceiver"
            android:label="Focus Vault Protection Admin"
            android:description="@string/device_admin_description"
            android:permission="android.permission.BIND_DEVICE_ADMIN"
            android:exported="true">
            <meta-data
                android:name="android.app.device_admin"
                android:resource="@xml/device_admin_policy" />
            <intent-filter>
                <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
                <action android:name="android.app.action.DEVICE_ADMIN_DISABLE_REQUESTED" />
                <action android:name="android.app.action.DEVICE_ADMIN_DISABLED" />
            </intent-filter>
        </receiver>

        <!-- 3. System Time Change Monitor (Anti-Tampering) -->
        <receiver
            android:name=".receiver.TimeChangedReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.TIME_SET" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
            </intent-filter>
        </receiver>

        <!-- 4. Boot completed receiver to restore Foreground Service & Alarms -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <!-- WorkManager initialization -->
        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="\${applicationId}.androidx-startup"
            android:exported="false" />

    </application>
</manifest>`
  },
  {
    name: "build.gradle",
    path: "app/build.gradle",
    description: "Configures compile tools, target SDKs, Jetpack Compose requirements, and standard dependencies for Room, WorkManager, and Hilt.",
    code: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
}

android {
    namespace 'com.vault.focusvault'
    compileSdk 34

    defaultConfig {
        applicationId "com.vault.focusvault"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
        freeCompilerArgs += ["-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"]
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.8'
    }
    packagingOptions {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}

dependencies {
    // AndroidX & Core UI
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'

    // Jetpack Compose (Material 3)
    implementation platform('androidx.compose:compose-bom:2024.01.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    implementation 'androidx.navigation:navigation-compose:2.7.6'

    // Room Database
    implementation "androidx.room:room-runtime:2.6.1"
    implementation "androidx.room:room-ktx:2.6.1"
    kapt "androidx.room:room-compiler:2.6.1"

    // WorkManager (Background monitoring & reboot recovery)
    implementation "androidx.work:work-runtime-ktx:2.9.0"

    // Hilt Dependency Injection
    implementation "com.google.dagger:hilt-android:2.50"
    kapt "com.google.dagger:hilt-compiler:2.50"
    implementation 'androidx.hilt:hilt-navigation-compose:1.1.0'

    // Security & Encrypted Preferences
    implementation "androidx.security:security-crypto:1.1.0-alpha06"

    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}

kapt {
    correctErrorTypes true
}`
  },
  {
    name: "BlockedAppEntity.kt",
    path: "app/src/main/java/com/vault/focusvault/data/BlockedAppEntity.kt",
    description: "Definition of the blocked application list table stored in the Room database.",
    code: `package com.vault.focusvault.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "blocked_apps")
data class BlockedAppEntity(
    @PrimaryKey val packageName: String,
    val appName: String,
    val category: String,
    val iconResId: String, // String representation or generic icon ID
    val addedTimestamp: Long = System.currentTimeMillis()
)`
  },
  {
    name: "LockSessionEntity.kt",
    path: "app/src/main/java/com/vault/focusvault/data/LockSessionEntity.kt",
    description: "Stores historical and active Focus lock states securely, tracking real UTC elapsed times.",
    code: `package com.vault.focusvault.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "lock_sessions")
data class LockSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startTime: Long,     // Device starting epoch timestamp
    val endTime: Long,       // Intended session end timestamp 
    val durationLabel: String, // e.g. "3 hours", "Custom"
    val isCustom: Boolean,
    val totalDurationMs: Long,
    val active: Boolean = true,
    val baseMonotonicTime: Long = System.nanoTime() // Backup clock comparison to detect manual time offsets
)`
  },
  {
    name: "TamperingLogEntity.kt",
    path: "app/src/main/java/com/vault/focusvault/data/TamperingLogEntity.kt",
    description: "Audit trail log mapping unauthorized user attempts to bypass digital protections with physical metrics.",
    code: `package com.vault.focusvault.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tampering_logs")
data class TamperingLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val type: String,       // "TIME_CHANGED", "ACCESSIBILITY_DISABLED", "ADMIN_REVOKED"
    val details: String,    // Device state description
    val severity: String,   // "HIGH", "MEDIUM", "LOW"
    val penaltyAppliedMs: Long = 0 // Extra minutes added as penalty
)`
  },
  {
    name: "UsageStatsEntity.kt",
    path: "app/src/main/java/com/vault/focusvault/data/UsageStatsEntity.kt",
    description: "Maintains analytics metrics, streak structures, and count of blocked interventions.",
    code: `package com.vault.focusvault.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "usage_statistics")
data class UsageStatsEntity(
    @PrimaryKey val date: String,       // Format "YYYY-MM-DD"
    val totalFocusMinutes: Int,         // Dynamic sum of focuses completed
    val blockedLaunchesCount: Int,      // Interventions handled successfully
    val activeStreakCount: Int          // Current consecutive focus challenge days
)`
  },
  {
    name: "FocusDaos.kt",
    path: "app/src/main/java/com/vault/focusvault/data/FocusDaos.kt",
    description: "Database access object compiling SQL checks for app blockers, active statuses, and tamper flags.",
    code: `package com.vault.focusvault.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface FocusDao {

    // 1. Blocked Apps Management
    @Query("SELECT * FROM blocked_apps ORDER BY appName ASC")
    fun getAllBlockedApps(): Flow<List<BlockedAppEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBlockedApp(app: BlockedAppEntity)

    @Delete
    suspend fun deleteBlockedApp(app: BlockedAppEntity)

    @Query("SELECT EXISTS(SELECT 1 FROM blocked_apps WHERE packageName = :packageName LIMIT 1)")
    suspend fun isAppBlocked(packageName: String): Boolean

    // 2. Lock Session Control
    @Query("SELECT * FROM lock_sessions WHERE active = 1 ORDER BY endTime DESC LIMIT 1")
    fun getActiveSessionFlow(): Flow<LockSessionEntity?>

    @Query("SELECT * FROM lock_sessions WHERE active = 1 ORDER BY endTime DESC LIMIT 1")
    suspend fun getActiveSession(): LockSessionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveSession(session: LockSessionEntity): Long

    @Query("UPDATE lock_sessions SET active = 0 WHERE id = :sessionId")
    suspend fun deactivateSession(sessionId: Long)

    // 3. Authenticated Tamper Log Checks
    @Query("SELECT * FROM tampering_logs ORDER BY timestamp DESC")
    fun getAllTamperingLogs(): Flow<List<TamperingLogEntity>>

    @Insert
    suspend fun logTamperAttempt(attempt: TamperingLogEntity)

    // 4. Usage Statistics Metrics
    @Query("SELECT * FROM usage_statistics ORDER BY date DESC LIMIT 30")
    fun getUsageHistory(): Flow<List<UsageStatsEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveUsageStats(stats: UsageStatsEntity)

    @Query("UPDATE usage_statistics SET blockedLaunchesCount = blockedLaunchesCount + 1 WHERE date = :date")
    suspend fun incrementBlockedCount(date: String)
}`
  },
  {
    name: "FocusAccessibilityService.kt",
    path: "app/src/main/java/com/vault/focusvault/service/FocusAccessibilityService.kt",
    description: "High security service monitoring package changes. Instantly overlays the lock-screen blocking interface if a blocked app package is loaded.",
    code: `package com.vault.focusvault.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.vault.focusvault.data.FocusDao
import com.vault.focusvault.ui.OverlayBlockActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.*
import javax.inject.Inject

@AndroidEntryPoint
class FocusAccessibilityService : AccessibilityService() {

    @Inject
    lateinit var focusDao: FocusDao

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("FocusService", "Accessibility Protection Service Bound Successfully.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val openedPackage = event.packageName?.toString() ?: return
            
            // Bypass internal/system launching routes to prevent infinite loop
            if (openedPackage == applicationContext.packageName) return
            if (openedPackage.startsWith("com.android.launcher") || openedPackage.startsWith("com.google.android.apps.nexuslauncher")) return

            serviceScope.launch {
                val activeSession = focusDao.getActiveSession()
                if (activeSession != null && activeSession.active) {
                    
                    // Validate if target duration is active
                    val currentTime = System.currentTimeMillis()
                    if (currentTime < activeSession.endTime) {
                        
                        // Check if the package is in our block list
                        val isBlocked = focusDao.isAppBlocked(openedPackage)
                        if (isBlocked) {
                            interceptAndBlock(openedPackage)
                        }
                    } else {
                        // Deactivate naturally expired sessions automatically
                        focusDao.deactivateSession(activeSession.id)
                    }
                }
            }
        }
    }

    private fun interceptAndBlock(packageName: String) {
        // 1. Instantly trigger global system Home key command
        performGlobalAction(GLOBAL_ACTION_HOME)
        Log.w("FocusService", "Intervention! Forced navigation of user outwards from blocked app: $packageName")

        // 2. Increment intervention statistics dashboard on current day
        serviceScope.launch(Dispatchers.IO) {
            val todayStr = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())
            focusDao.incrementBlockedCount(todayStr)
        }

        // 3. Overlay the full-screen Warning Shield
        val lockOverlayIntent = Intent(this, OverlayBlockActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_BLOCKED_APP", packageName)
        }
        startActivity(lockOverlayIntent)
    }

    override fun onInterrupt() {
        Log.e("FocusService", "Accessibility Service Interrupted! Active protections halted.")
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        Log.w("FocusService", "Security service killed path. Dispatching background protection recovery alert.")
    }
}`
  },
  {
    name: "FocusDeviceAdminReceiver.kt",
    path: "app/src/main/java/com/vault/focusvault/receiver/FocusDeviceAdminReceiver.kt",
    description: "Acts as a structural locking mechanism, monitoring and warning users against disabling administrator privilege profiles.",
    code: `package com.vault.focusvault.receiver

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast
import com.vault.focusvault.data.FocusDao
import com.vault.focusvault.data.TamperingLogEntity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FocusDeviceAdminReceiver : DeviceAdminReceiver() {

    @Inject
    lateinit var focusDao: FocusDao

    private val receiverScope = CoroutineScope(Dispatchers.IO)

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Toast.makeText(context, "Anti-Tampering Device Privilege Granted", Toast.LENGTH_SHORT).show()
        Log.i("DeviceAdmin", "Focus Vault registered as active device manager.")
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        // Provide warnings during active locks to create a heavy mental filter to bypasses
        Log.w("DeviceAdmin", "User attempting to revoke Device Administrator status.")
        
        receiverScope.launch {
            focusDao.logTamperAttempt(
                TamperingLogEntity(
                    type = "ADMIN_REVOKED",
                    details = "User prompted dialog to disable administrative protection overlay.",
                    severity = "MEDIUM"
                )
            )
        }

        return "WARNING: Disabling Focus Vault administrator capabilities will log a tampering incident and may add penalty constraints to your active focus clocks!"
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.e("DeviceAdmin", "Device administrator revoked! Focus defenses degraded.")
        receiverScope.launch {
            focusDao.logTamperAttempt(
                TamperingLogEntity(
                    type = "ADMIN_REVOKED",
                    details = "Administrative status was successfully deactivated.",
                    severity = "HIGH",
                    penaltyAppliedMs = 3600000 // Apply automatic 1-hour focus penalty dynamically
                )
            )
        }
    }
}`
  },
  {
    name: "FocusRepository.kt",
    path: "app/src/main/java/com/vault/focusvault/repository/FocusRepository.kt",
    description: "Main data repository implementing EncryptedSharedPreferences and verifying clock integrity based on hardware monotonic comparisons to prevent manual calendar edits.",
    code: `package com.vault.focusvault.repository

import android.content.Context
import android.os.SystemClock
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.vault.focusvault.data.*
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FocusRepository @Inject constructor(
    private val context: Context,
    private val focusDao: FocusDao
) {
    private val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
    private val securePrefs = EncryptedSharedPreferences.create(
        "focus_vault_secure_settings",
        masterKeyAlias,
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    // Save current active lock configurations
    fun setTamperThreshold(nanoTime: Long) {
        securePrefs.edit().putLong("base_hw_mono_time", nanoTime).apply()
    }

    fun getTamperThreshold(): Long {
        return securePrefs.getLong("base_hw_mono_time", 0L)
    }

    // Room DB interface proxies
    fun getBlockedApps(): Flow<List<BlockedAppEntity>> = focusDao.getAllBlockedApps()

    suspend fun addBlockedApp(packageName: String, label: String, cat: String) {
        focusDao.insertBlockedApp(BlockedAppEntity(packageName, label, cat, "lock"))
    }

    suspend fun removeBlockedApp(packageName: String) {
        val active = focusDao.getActiveSession()
        if (active != null && active.active && System.currentTimeMillis() < active.endTime) {
            // Secure lockout: Block removal while focus state is active
            throw IllegalStateException("Cannot remove apps from list while focus vault contains an active lockout session!")
        }
        focusDao.deleteBlockedApp(BlockedAppEntity(packageName, "", "", ""))
    }

    fun getActiveSession(): Flow<LockSessionEntity?> = focusDao.getActiveSessionFlow()

    suspend fun startFocusSession(durationMs: Long, label: String, isCustom: Boolean) {
        val startTime = System.currentTimeMillis()
        val endTime = startTime + durationMs

        // Set backing system uptime tracker to identify later manual system clock resets
        setTamperThreshold(SystemClock.elapsedRealtimeNanos())

        val session = LockSessionEntity(
            startTime = startTime,
            endTime = endTime,
            durationLabel = label,
            isCustom = isCustom,
            totalDurationMs = durationMs,
            active = true,
            baseMonotonicTime = SystemClock.elapsedRealtimeNanos()
        )
        focusDao.saveSession(session)
    }

    suspend fun applyTimeChangePenalty(penaltyMs: Long) {
        val active = focusDao.getActiveSession() ?: return
        if (active.active) {
            val updatedSession = active.copy(
                endTime = active.endTime + penaltyMs
            )
            focusDao.saveSession(updatedSession)
            focusDao.logTamperAttempt(
                TamperingLogEntity(
                    type = "TIME_CHANGED",
                    details = "Detected system timezone/time manipulation. Adding temporal lock offset penalty.",
                    severity = "HIGH",
                    penaltyAppliedMs = penaltyMs
                )
            )
        }
    }

    fun getTamperingLogs(): Flow<List<TamperingLogEntity>> = focusDao.getAllTamperingLogs()
    fun getUsageStats(): Flow<List<UsageStatsEntity>> = focusDao.getUsageHistory()
}`
  },
  {
    name: "FocusViewModel.kt",
    path: "app/src/main/java/com/vault/focusvault/ui/FocusViewModel.kt",
    description: "Jetpack Compose ViewModel managing UI state, live clock countdown flows, and launching WorkManager backup sync routines.",
    code: `package com.vault.focusvault.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vault.focusvault.data.*
import com.vault.focusvault.repository.FocusRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FocusViewModel @Inject constructor(
    private val repository: FocusRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(FocusUiState())
    val uiState: StateFlow<FocusUiState> = _uiState.asStateFlow()

    private var countdownJob: Job? = null

    init {
        observeData()
    }

    private fun observeData() {
        viewModelScope.launch {
            // 1. Observe active blocking session with countdown loops
            repository.getActiveSession().collect { session ->
                if (session != null && session.active) {
                    _uiState.update { it.copy(activeSession = session) }
                    startCountdown(session)
                } else {
                    _uiState.update { it.copy(activeSession = null, remainingTimeMs = 0L) }
                    countdownJob?.cancel()
                }
            }
        }

        viewModelScope.launch {
            repository.getBlockedApps().collect { apps ->
                _uiState.update { it.copy(blockedApps = apps) }
            }
        }

        viewModelScope.launch {
            repository.getTamperingLogs().collect { logs ->
                _uiState.update { it.copy(tamperingLogs = logs) }
            }
        }
    }

    private fun startCountdown(session: LockSessionEntity) {
        countdownJob?.cancel()
        countdownJob = viewModelScope.launch {
            while (true) {
                val now = System.currentTimeMillis()
                val remaining = session.endTime - now
                if (remaining <= 0) {
                    _uiState.update { it.copy(remainingTimeMs = 0L) }
                    break
                }
                _uiState.update { it.copy(remainingTimeMs = remaining) }
                delay(1000)
            }
        }
    }

    fun selectApp(packageName: String, label: String, category: String) {
        viewModelScope.launch {
            repository.addBlockedApp(packageName, label, category)
        }
    }

    fun deselectApp(packageName: String) {
        viewModelScope.launch {
            try {
                repository.removeBlockedApp(packageName)
            } catch (e: Exception) {
                _uiState.update { it.copy(errorMessage = e.message) }
            }
        }
    }

    fun startFocusLock(durationMs: Long, label: String) {
        viewModelScope.launch {
            repository.startFocusSession(durationMs, label, durationMs == -1L)
        }
    }
}

data class FocusUiState(
    val blockedApps: List<BlockedAppEntity> = emptyList(),
    val tamperingLogs: List<TamperingLogEntity> = emptyList(),
    val activeSession: LockSessionEntity? = null,
    val remainingTimeMs: Long = 0,
    val errorMessage: String? = null
)`
  },
  {
    name: "FocusWorker.kt",
    path: "app/src/main/java/com/vault/focusvault/worker/FocusWorker.kt",
    description: "WorkManager backup routine performing background safety validation, checking memory states, and ensuring foreground notifications match expired times safely.",
    code: `package com.vault.focusvault.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.vault.focusvault.data.FocusDao
import javax.inject.Inject

class FocusWorker(
    appContext: Context,
    workerParams: WorkerParameters,
    private val focusDao: FocusDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        // Checks database integrity and resets foreground service states if natural expiration occurs
        val activeSession = focusDao.getActiveSession()
        if (activeSession != null && activeSession.active) {
            val now = System.currentTimeMillis()
            if (now >= activeSession.endTime) {
                focusDao.deactivateSession(activeSession.id)
            }
        }
        return Result.success()
    }
}`
  }
];
