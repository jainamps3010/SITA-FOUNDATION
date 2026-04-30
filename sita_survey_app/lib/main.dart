import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

const baseUrl = 'https://sita-backend-whn2.onrender.com/api/v1';

// ─── Colors ────────────────────────────────────────────────────────────────
const kPrimary = Color(0xFF1A237E);
const kPrimaryDark = Color(0xFF0D1757);
const kPrimaryLight = Color(0xFFE8EAF6);
const kSecondary = Color(0xFFFF8F00);
const kSecondaryDark = Color(0xFFE65100);
const kSuccess = Color(0xFF00897B);
const kError = Color(0xFFC62828);
const kBg = Color(0xFFF5F5F5);
const kTextPrimary = Color(0xFF1A1A1A);
const kTextSecondary = Color(0xFF757575);
const kDivider = Color(0xFFE0E0E0);

// ─── App ───────────────────────────────────────────────────────────────────
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const SitaSurveyApp());
}

class SitaSurveyApp extends StatelessWidget {
  const SitaSurveyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SITA Survey',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: kPrimary,
          primary: kPrimary,
          secondary: kSecondary,
          error: kError,
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: kBg,
        appBarTheme: const AppBarTheme(
          backgroundColor: kPrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.light,
          ),
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: kSecondary,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.4),
            elevation: 0,
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: kPrimary,
            side: const BorderSide(color: kPrimary, width: 1.5),
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(
                fontSize: 15, fontWeight: FontWeight.w600),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: kDivider),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: kDivider),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: kPrimary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: kError),
          ),
          labelStyle: const TextStyle(color: kTextSecondary),
          hintStyle: const TextStyle(color: kTextSecondary, fontSize: 14),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: kDivider, width: 0.8),
          ),
          margin: EdgeInsets.zero,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

// ─── Session ───────────────────────────────────────────────────────────────
class Session {
  static String? token;
  static String? agentName;
  static String agentStatus = 'pending'; // 'pending', 'approved', 'blocked'

  static const _kToken = 'survey_token';
  static const _kName = 'survey_agent_name';
  static const _kStatus = 'survey_agent_status';

  static Future<void> persist() async {
    final p = await SharedPreferences.getInstance();
    if (token != null) await p.setString(_kToken, token!);
    if (agentName != null) await p.setString(_kName, agentName!);
    await p.setString(_kStatus, agentStatus);
  }

  static Future<bool> restore() async {
    final p = await SharedPreferences.getInstance();
    final t = p.getString(_kToken);
    if (t == null) return false;
    token = t;
    agentName = p.getString(_kName);
    agentStatus = p.getString(_kStatus) ?? 'approved';
    return true;
  }

  static Future<void> clear() async {
    token = null;
    agentName = null;
    agentStatus = 'pending';
    final p = await SharedPreferences.getInstance();
    await p.remove(_kToken);
    await p.remove(_kName);
    await p.remove(_kStatus);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
Map<String, String> get _headers => {
      'Content-Type': 'application/json',
      if (Session.token != null) 'Authorization': 'Bearer ${Session.token}',
    };

void showSnack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(msg,
        style: const TextStyle(fontWeight: FontWeight.w500)),
    backgroundColor: error ? kError : kSuccess,
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    margin: const EdgeInsets.all(16),
  ));
}

Widget _buildCard({required Widget child}) => Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kDivider, width: 0.8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          )
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: child,
    );

Widget _sectionLabel(String text) => Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text,
          style: const TextStyle(
              fontSize: 11,
              color: kTextSecondary,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8)),
    );

// ─── Step Progress Bar ─────────────────────────────────────────────────────
class SurveyStepBar extends StatelessWidget {
  final int currentStep; // 1-based
  final int totalSteps;
  final List<String> stepLabels;

  const SurveyStepBar({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step indicator row
          Row(
            children: List.generate(totalSteps * 2 - 1, (i) {
              if (i.isOdd) {
                // Connector
                final stepIndex = i ~/ 2 + 1;
                final isDone = stepIndex < currentStep;
                return Expanded(
                  child: Container(
                    height: 3,
                    decoration: BoxDecoration(
                      color: isDone ? kSecondary : kDivider,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }
              // Step circle
              final step = i ~/ 2 + 1;
              final isActive = step == currentStep;
              final isDone = step < currentStep;
              return Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isDone
                      ? kSecondary
                      : isActive
                          ? kPrimary
                          : kDivider,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: isDone
                      ? const Icon(Icons.check, color: Colors.white, size: 16)
                      : Text(
                          '$step',
                          style: TextStyle(
                            color: isActive ? Colors.white : kTextSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          // Labels row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(totalSteps, (i) {
              final isActive = i + 1 == currentStep;
              final isDone = i + 1 < currentStep;
              return Text(
                stepLabels[i],
                style: TextStyle(
                  fontSize: 11,
                  fontWeight:
                      isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isDone
                      ? kSecondary
                      : isActive
                          ? kPrimary
                          : kTextSecondary,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

// ─── Splash ────────────────────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final hasSession = await Session.restore();
    if (!mounted) return;
    Widget next;
    if (hasSession) {
      if (Session.agentStatus == 'blocked') {
        next = const BlockedScreen();
      } else if (Session.agentStatus == 'pending') {
        next = const PendingApprovalScreen();
      } else {
        next = const HomeScreen();
      }
    } else {
      next = const LoginScreen();
    }
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => next));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPrimary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: ClipOval(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Image.asset('assets/logo.png', fit: BoxFit.contain),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
          ],
        ),
      ),
    );
  }
}

// ─── Login ─────────────────────────────────────────────────────────────────
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _sendOtp() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.length != 10) {
      showSnack(context, 'Enter a valid 10-digit mobile number', error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone, 'role': 'survey_agent'}),
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200) {
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)));
      } else {
        final code = body['code'] as String?;
        String msg;
        if (code == 'NOT_REGISTERED') {
          msg = 'You are not registered as a Survey Agent. Please contact SITA Foundation to get access.';
        } else if (code == 'BLOCKED') {
          msg = 'Your access has been blocked. Contact SITA Foundation.';
        } else {
          msg = body['message'] ?? 'Failed to send OTP';
        }
        showSnack(context, msg, error: true);
      }
    } catch (e) {
      if (mounted) showSnack(context, 'Network error. Check your connection.', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Header with gradient + logo
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 56, 24, 48),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [kPrimaryDark, kPrimary, Color(0xFF283593)],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(40),
                    bottomRight: Radius.circular(40),
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.22),
                            blurRadius: 24,
                            offset: const Offset(0, 10),
                          )
                        ],
                      ),
                      child: ClipOval(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Image.asset('assets/logo.png',
                              height: 100, fit: BoxFit.contain),
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    const Text(
                      'SITA Survey',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Field Agent Portal',
                      style: TextStyle(color: Colors.white60, fontSize: 14),
                    ),
                  ],
                ),
              ),

              // Form card
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _buildCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Agent Login',
                              style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: kPrimary)),
                          const SizedBox(height: 6),
                          const Text('Enter your registered mobile number',
                              style: TextStyle(
                                  color: kTextSecondary, fontSize: 13)),
                          const SizedBox(height: 20),
                          _sectionLabel('MOBILE NUMBER'),
                          TextField(
                            controller: _phoneCtrl,
                            keyboardType: TextInputType.phone,
                            maxLength: 10,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly
                            ],
                            decoration: const InputDecoration(
                              hintText: '10-digit mobile number',
                              prefixText: '+91  ',
                              prefixStyle: TextStyle(
                                  color: kTextPrimary,
                                  fontWeight: FontWeight.w600),
                              counterText: '',
                            ),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: _loading ? null : _sendOtp,
                            child: _loading
                                ? const SizedBox(
                                    height: 22,
                                    width: 22,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white))
                                : const Text('Send OTP'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: kPrimaryLight,
                        borderRadius: BorderRadius.circular(14),
                        border:
                            Border.all(color: kPrimary.withOpacity(0.2)),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.poll_outlined,
                              color: kPrimary, size: 20),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'This portal is for SITA Foundation field agents only. Contact your coordinator for access.',
                              style: TextStyle(
                                  color: kPrimary,
                                  fontSize: 13,
                                  height: 1.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── OTP ───────────────────────────────────────────────────────────────────
class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _verifyOtp() async {
    final otp = _otpCtrl.text.trim();
    if (otp.isEmpty) {
      showSnack(context, 'Enter the OTP', error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        headers: _headers,
        body: jsonEncode({'phone': widget.phone, 'otp': otp}),
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200) {
        Session.token = body['token'] ?? body['data']?['token'];
        Session.agentName = body['data']?['name'] ??
            body['name'] ??
            body['data']?['agent']?['name'] ??
            'Agent';
        Session.agentStatus = body['agent_status'] ?? 'approved';
        await Session.persist();
        if (!mounted) return;

        Widget nextScreen;
        if (Session.agentStatus == 'blocked') {
          nextScreen = const BlockedScreen();
        } else if (Session.agentStatus == 'pending') {
          nextScreen = const PendingApprovalScreen();
        } else {
          nextScreen = const HomeScreen();
        }

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => nextScreen),
          (_) => false,
        );
      } else {
        showSnack(context, body['message'] ?? 'Invalid OTP', error: true);
      }
    } catch (e) {
      if (mounted) showSnack(context, 'Network error', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: kPrimaryLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kPrimary.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.sms_outlined,
                        color: kPrimary, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'OTP sent to +91 ${widget.phone}',
                        style: const TextStyle(
                            color: kPrimary,
                            fontWeight: FontWeight.w600,
                            fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              _buildCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionLabel('ENTER 6-DIGIT OTP'),
                    TextField(
                      controller: _otpCtrl,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly
                      ],
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 10),
                      decoration: const InputDecoration(
                        hintText: '------',
                        hintStyle: TextStyle(letterSpacing: 10),
                        counterText: '',
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _loading ? null : _verifyOtp,
                      child: _loading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Text('Verify & Login'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Pending Approval ──────────────────────────────────────────────────────
class PendingApprovalScreen extends StatelessWidget {
  const PendingApprovalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  shape: BoxShape.circle,
                  border: Border.all(color: kSecondary.withOpacity(0.3), width: 2),
                ),
                child: ClipOval(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Image.asset('assets/logo.png', fit: BoxFit.contain),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Pending Approval',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: kPrimary),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: kSecondary.withOpacity(0.3)),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.hourglass_empty_rounded, color: kSecondary, size: 40),
                    SizedBox(height: 12),
                    Text(
                      'Your account is pending admin approval.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: kTextPrimary),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Please wait for SITA Foundation to review and approve your account. You will be able to submit surveys once approved.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: kTextSecondary, height: 1.5),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              OutlinedButton.icon(
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Back to Login'),
                onPressed: () async {
                  await Session.clear();
                  if (!context.mounted) return;
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (_) => false,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Blocked ───────────────────────────────────────────────────────────────
class BlockedScreen extends StatelessWidget {
  const BlockedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFEBEE),
                  shape: BoxShape.circle,
                  border: Border.all(color: kError.withOpacity(0.3), width: 2),
                ),
                child: const Icon(Icons.block_rounded, color: kError, size: 48),
              ),
              const SizedBox(height: 32),
              const Text(
                'Account Blocked',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: kError),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFEBEE),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: kError.withOpacity(0.2)),
                ),
                child: const Column(
                  children: [
                    Text(
                      'Your account has been blocked.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: kTextPrimary),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Please contact SITA Foundation for assistance.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: kTextSecondary, height: 1.5),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'support@sitafoundation.org',
                      style: TextStyle(fontSize: 13, color: kError, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: kError,
                  side: const BorderSide(color: kError),
                ),
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Back to Login'),
                onPressed: () async {
                  await Session.clear();
                  if (!context.mounted) return;
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (_) => false,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Home ──────────────────────────────────────────────────────────────────
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: Image.asset('assets/logo.png', fit: BoxFit.cover),
              ),
            ),
            const SizedBox(width: 10),
            const Text('SITA Survey'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Logout',
            onPressed: () async {
              await Session.clear();
              if (!context.mounted) return;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (_) => false,
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Agent card
          _buildCard(
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: kPrimaryLight,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.person_outline,
                      color: kPrimary, size: 30),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Welcome back,',
                        style:
                            TextStyle(color: kTextSecondary, fontSize: 13)),
                    Text(
                      Session.agentName ?? 'Agent',
                      style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: kPrimary),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          const Text('Actions',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: kTextPrimary)),
          const SizedBox(height: 14),
          _HomeActionCard(
            icon: Icons.add_circle_outline_rounded,
            iconBg: kPrimaryLight,
            iconColor: kPrimary,
            title: 'Start New Survey',
            subtitle: 'Record entity & consumption data',
            badgeColor: kSecondary,
            badgeLabel: 'NEW',
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const NewSurveyScreen())),
          ),
          const SizedBox(height: 12),
          _HomeActionCard(
            icon: Icons.list_alt_rounded,
            iconBg: const Color(0xFFE0F2F1),
            iconColor: kSuccess,
            title: 'View All Surveys',
            subtitle: 'Browse submitted entities',
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const SurveysListScreen())),
          ),
          const SizedBox(height: 12),
          _HomeActionCard(
            icon: Icons.history_rounded,
            iconBg: const Color(0xFFF3E5F5),
            iconColor: const Color(0xFF7B1FA2),
            title: 'My Surveys',
            subtitle: 'View your submitted surveys',
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const MySurveysScreen())),
          ),
          const SizedBox(height: 12),
          _HomeActionCard(
            icon: Icons.contact_support_outlined,
            iconBg: const Color(0xFFE8F5E9),
            iconColor: const Color(0xFF2E7D32),
            title: 'Contact Us',
            subtitle: 'Reach SITA Foundation support',
            onTap: () => _showContactSheet(context),
          ),
        ],
      ),
    );
  }
}

void _showContactSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (_) => const _ContactBottomSheet(),
  );
}

class _ContactBottomSheet extends StatelessWidget {
  const _ContactBottomSheet();

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40, height: 4,
            decoration: BoxDecoration(
              color: kDivider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Container(
            width: 72, height: 72,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: kPrimary.withOpacity(0.2), width: 2),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 4))],
            ),
            child: ClipOval(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Image.asset('assets/logo.png', fit: BoxFit.contain),
              ),
            ),
          ),
          const SizedBox(height: 14),
          const Text('Contact SITA Foundation',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: kPrimary)),
          const SizedBox(height: 4),
          const Text('We\'re here to help',
              style: TextStyle(color: kTextSecondary, fontSize: 13)),
          const SizedBox(height: 24),
          _ContactTile(
            icon: Icons.email_outlined,
            color: kPrimary,
            title: 'Email',
            subtitle: 'chairman@sita.foundation',
            onTap: () => _launch('mailto:chairman@sita.foundation'),
          ),
          const SizedBox(height: 10),
          _ContactTile(
            icon: Icons.phone_outlined,
            color: kSuccess,
            title: 'Phone 1',
            subtitle: '+91 7069924365',
            onTap: () => _launch('tel:+917069924365'),
          ),
          const SizedBox(height: 10),
          _ContactTile(
            icon: Icons.phone_outlined,
            color: kSuccess,
            title: 'Phone 2',
            subtitle: '+91 7069824365',
            onTap: () => _launch('tel:+917069824365'),
          ),
          const SizedBox(height: 10),
          _ContactTile(
            icon: Icons.chat_outlined,
            color: const Color(0xFF25D366),
            title: 'WhatsApp',
            subtitle: '+91 7069924365',
            onTap: () => _launch('https://wa.me/917069924365'),
          ),
        ],
      ),
    );
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ContactTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kDivider, width: 0.8),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(fontSize: 11, color: kTextSecondary, fontWeight: FontWeight.w600)),
                  Text(subtitle,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kTextPrimary)),
                ],
              ),
            ),
            Icon(Icons.open_in_new_rounded, color: color, size: 18),
          ],
        ),
      ),
    );
  }
}

class _HomeActionCard extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color? badgeColor;
  final String? badgeLabel;

  const _HomeActionCard({
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badgeColor,
    this.badgeLabel,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kDivider, width: 0.8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            )
          ],
        ),
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                  color: iconBg, borderRadius: BorderRadius.circular(14)),
              child: Icon(icon, color: iconColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(title,
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: kTextPrimary)),
                      if (badgeLabel != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: badgeColor,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(badgeLabel!,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800)),
                        ),
                      ]
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(subtitle,
                      style: const TextStyle(
                          fontSize: 13, color: kTextSecondary)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: kTextSecondary),
          ],
        ),
      ),
    );
  }
}

// ─── New Survey (Step 1: Entity) ───────────────────────────────────────────
class NewSurveyScreen extends StatefulWidget {
  const NewSurveyScreen({super.key});

  @override
  State<NewSurveyScreen> createState() => _NewSurveyScreenState();
}

class _NewSurveyScreenState extends State<NewSurveyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _entityNameCtrl = TextEditingController();
  final _ownerNameCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _districtCtrl = TextEditingController();
  final _talukaCtrl = TextEditingController();
  String? _entityType;
  bool _loading = false;

  static const entityTypes = [
    'Hotel',
    'Restaurant',
    'Resort',
    'Caterer',
    'Annakshetra',
    'Temple Kitchen',
  ];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_entityType == null) {
      showSnack(context, 'Please select entity type', error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/survey/entity'),
        headers: _headers,
        body: jsonEncode({
          'entity_name': _entityNameCtrl.text.trim(),
          'owner_name': _ownerNameCtrl.text.trim(),
          'mobile': _mobileCtrl.text.trim(),
          'entity_type': _entityType,
          'address': _addressCtrl.text.trim(),
          'district': _districtCtrl.text.trim(),
          'taluka': _talukaCtrl.text.trim(),
        }),
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        final entityId = body['data']?['id'] ??
            body['data']?['entity_id'] ??
            body['id'] ??
            body['entity_id'];
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                ConsumptionScreen(entityId: entityId?.toString()),
          ),
        );
      } else {
        showSnack(context, body['message'] ?? 'Failed to submit',
            error: true);
      }
    } catch (e) {
      if (mounted) showSnack(context, 'Network error', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Survey')),
      body: Column(
        children: [
          // Step progress bar
          SurveyStepBar(
            currentStep: 1,
            totalSteps: 3,
            stepLabels: const [
              'Entity Details',
              'Consumption',
              'Submit',
            ],
          ),
          const Divider(height: 1, color: kDivider),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Entity Details',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: kPrimary)),
                        const SizedBox(height: 18),
                        _sectionLabel('ENTITY NAME'),
                        TextFormField(
                          controller: _entityNameCtrl,
                          decoration: const InputDecoration(
                              hintText: 'e.g. Hotel Sunrise'),
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: 14),
                        _sectionLabel('OWNER NAME'),
                        TextFormField(
                          controller: _ownerNameCtrl,
                          decoration: const InputDecoration(
                              hintText: 'e.g. Ramesh Patel'),
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: 14),
                        _sectionLabel('MOBILE'),
                        TextFormField(
                          controller: _mobileCtrl,
                          keyboardType: TextInputType.phone,
                          maxLength: 10,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly
                          ],
                          decoration: const InputDecoration(
                              hintText: '10-digit mobile',
                              counterText: ''),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty)
                              return 'Required';
                            if (v.trim().length != 10)
                              return 'Enter 10 digits';
                            return null;
                          },
                        ),
                        const SizedBox(height: 14),
                        _sectionLabel('ENTITY TYPE'),
                        DropdownButtonFormField<String>(
                          value: _entityType,
                          decoration: const InputDecoration(
                              hintText: 'Select entity type'),
                          items: entityTypes
                              .map((t) => DropdownMenuItem(
                                  value: t, child: Text(t)))
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _entityType = v),
                          validator: (v) =>
                              v == null ? 'Please select' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Location',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: kPrimary)),
                        const SizedBox(height: 18),
                        _sectionLabel('ADDRESS'),
                        TextFormField(
                          controller: _addressCtrl,
                          maxLines: 2,
                          decoration: const InputDecoration(
                              hintText: 'Full address'),
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  _sectionLabel('DISTRICT'),
                                  TextFormField(
                                    controller: _districtCtrl,
                                    decoration: const InputDecoration(
                                        hintText: 'e.g. Surat'),
                                    validator: (v) =>
                                        v == null || v.trim().isEmpty
                                            ? 'Required'
                                            : null,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  _sectionLabel('TALUKA'),
                                  TextFormField(
                                    controller: _talukaCtrl,
                                    decoration: const InputDecoration(
                                        hintText: 'e.g. Daskroi'),
                                    validator: (v) =>
                                        v == null || v.trim().isEmpty
                                            ? 'Required'
                                            : null,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: _loading ? null : _submit,
                    icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                    label: _loading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Next: Consumption Data'),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Consumption (Step 2) ──────────────────────────────────────────────────
class _ProductEntry {
  final productCtrl = TextEditingController();
  final brandCtrl = TextEditingController();
  final quantityCtrl = TextEditingController();
  final priceCtrl = TextEditingController();
  String? category;
  String? unit;
}

class ConsumptionScreen extends StatefulWidget {
  final String? entityId;
  const ConsumptionScreen({super.key, this.entityId});

  @override
  State<ConsumptionScreen> createState() => _ConsumptionScreenState();
}

class _ConsumptionScreenState extends State<ConsumptionScreen> {
  final _formKey = GlobalKey<FormState>();
  final List<_ProductEntry> _products = [_ProductEntry()];
  bool _loading = false;
  bool _scanningInvoice = false;
  String? _invoicePhotoUrl;
  String? _vendorName;
  String _mode = 'none'; // 'none', 'scan', 'manual'
  final List<XFile> _billPhotoFiles = [];

  static const categories = ['Oils', 'Grains', 'Spices', 'Gas', 'Cleaning'];
  static const units = ['Kg', 'Liters', 'Bags', 'Cylinders'];

  static String _guessCategory(String name) {
    final n = name.toLowerCase();
    if (n.contains('oil')) return 'Oils';
    if (n.contains('gas') || n.contains('cylinder')) return 'Gas';
    if (n.contains('soap') || n.contains('detergent') || n.contains('clean')) return 'Cleaning';
    if (n.contains('spice') || n.contains('chili') || n.contains('pepper') ||
        n.contains('turmeric') || n.contains('masala') || n.contains('cumin') ||
        n.contains('dal') || n.contains('daal')) return 'Spices';
    return 'Grains';
  }

  Future<void> _scanInvoice() async {
    final picker = ImagePicker();
    final photo = await picker.pickImage(source: ImageSource.camera, imageQuality: 85);
    if (photo == null) return;

    setState(() => _scanningInvoice = true);
    try {
      final req = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/survey/scan-invoice'),
      );
      if (Session.token != null) {
        req.headers['Authorization'] = 'Bearer ${Session.token}';
      }
      req.files.add(await http.MultipartFile.fromPath('invoice', photo.path));

      final streamed = await req.send();
      final res = await http.Response.fromStream(streamed);
      final body = jsonDecode(res.body);

      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        final extracted = body['extracted_data'] as Map<String, dynamic>;
        final photoUrl = body['invoice_photo_url'] as String?;
        final products = extracted['products'] as List? ?? [];

        setState(() {
          _invoicePhotoUrl = photoUrl;
          _vendorName = extracted['vendor_name'] as String?;
          _products.clear();
          for (final p in products) {
            final entry = _ProductEntry();
            final name = p['name'] ?? '';
            entry.productCtrl.text = name;
            entry.quantityCtrl.text = '${p['quantity'] ?? ''}';
            entry.priceCtrl.text = '${p['price'] ?? ''}';
            final rawUnit = p['unit'] as String?;
            entry.unit = units.contains(rawUnit) ? rawUnit : null;
            entry.category = _guessCategory(name);
            _products.add(entry);
          }
          if (_products.isEmpty) _products.add(_ProductEntry());
        });

        if (mounted) {
          showSnack(context,
              products.isEmpty
                  ? 'Invoice saved. No products extracted.'
                  : 'Invoice scanned! ${products.length} products found');
        }
      } else {
        showSnack(context, body['message'] ?? 'Scan failed', error: true);
      }
    } catch (e) {
      if (mounted) showSnack(context, 'Network error during scan', error: true);
    } finally {
      if (mounted) setState(() => _scanningInvoice = false);
    }
  }

  int _annualQty(int index) {
    return (int.tryParse(_products[index].quantityCtrl.text) ?? 0) * 12;
  }

  Future<void> _addBillPhoto() async {
    if (_billPhotoFiles.length >= 10) return;
    final picker = ImagePicker();
    final photo = await picker.pickImage(source: ImageSource.camera, imageQuality: 85);
    if (photo == null) return;
    setState(() => _billPhotoFiles.add(photo));
  }

  Future<List<String>> _uploadBillPhotos() async {
    if (_billPhotoFiles.isEmpty) return [];
    final req = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/survey/upload-invoice-photos'),
    );
    if (Session.token != null) {
      req.headers['Authorization'] = 'Bearer ${Session.token}';
    }
    for (final file in _billPhotoFiles) {
      req.files.add(await http.MultipartFile.fromPath('photos', file.path));
    }
    final streamed = await req.send();
    final res = await http.Response.fromStream(streamed);
    final body = jsonDecode(res.body);
    if (res.statusCode == 200 || res.statusCode == 201) {
      return List<String>.from(body['invoice_photos_urls'] as List);
    }
    throw Exception(body['message'] ?? 'Failed to upload photos');
  }

  Future<void> _submit() async {
    if (_mode == 'manual') {
      if (!_formKey.currentState!.validate()) return;
      for (int i = 0; i < _products.length; i++) {
        final p = _products[i];
        if (p.category == null) {
          showSnack(context, 'Select category for product ${i + 1}', error: true);
          return;
        }
        if (p.unit == null) {
          showSnack(context, 'Select unit for product ${i + 1}', error: true);
          return;
        }
      }
    } else if (_mode == 'scan') {
      if (_invoicePhotoUrl == null) {
        showSnack(context, 'Please scan an invoice first', error: true);
        return;
      }
      for (int i = 0; i < _products.length; i++) {
        if (_products[i].productCtrl.text.trim().isEmpty) {
          showSnack(context, 'Product ${i + 1} has no name', error: true);
          return;
        }
      }
    }
    setState(() => _loading = true);
    try {
      final billPhotoUrls = await _uploadBillPhotos();

      final productsData = _products
          .map((p) => {
                'product_name': p.productCtrl.text.trim(),
                'brand': p.brandCtrl.text.trim(),
                'category': p.category,
                'monthly_quantity':
                    int.tryParse(p.quantityCtrl.text) ?? 0,
                'annual_quantity':
                    (int.tryParse(p.quantityCtrl.text) ?? 0) * 12,
                'unit': p.unit,
                'price_per_unit':
                    double.tryParse(p.priceCtrl.text) ?? 0.0,
              })
          .toList();

      final res = await http.post(
        Uri.parse('$baseUrl/survey/consumption'),
        headers: _headers,
        body: jsonEncode({
          'entity_id': widget.entityId,
          'products': productsData,
          if (_invoicePhotoUrl != null) 'invoice_photo_url': _invoicePhotoUrl,
          if (billPhotoUrls.isNotEmpty) 'invoice_photos_urls': billPhotoUrls,
        }),
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        showSnack(context, 'Survey submitted successfully!');
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (_) => false,
        );
      } else {
        showSnack(context, body['message'] ?? 'Failed to submit',
            error: true);
      }
    } catch (e) {
      if (mounted) showSnack(context, 'Network error', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Consumption Data')),
      body: Column(
        children: [
          SurveyStepBar(
            currentStep: 2,
            totalSteps: 3,
            stepLabels: const ['Entity Details', 'Consumption', 'Submit'],
          ),
          const Divider(height: 1, color: kDivider),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // ─── Entity ID Banner ─────────────────────────────────
                  if (widget.entityId != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2F1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kSuccess.withOpacity(0.4)),
                      ),
                      child: Row(children: [
                        const Icon(Icons.check_circle_outline, color: kSuccess, size: 18),
                        const SizedBox(width: 8),
                        Text('Entity ID: ${widget.entityId}',
                            style: const TextStyle(color: kSuccess, fontWeight: FontWeight.w600, fontSize: 13)),
                      ]),
                    ),

                  // ─── Mode Toggle ──────────────────────────────────────
                  Row(children: [
                    Expanded(child: _ModeButton(
                      icon: Icons.document_scanner_outlined,
                      label: 'Scan Invoice',
                      selected: _mode == 'scan',
                      onTap: () => setState(() => _mode = 'scan'),
                    )),
                    const SizedBox(width: 12),
                    Expanded(child: _ModeButton(
                      icon: Icons.edit_outlined,
                      label: 'Add Manually',
                      selected: _mode == 'manual',
                      onTap: () => setState(() => _mode = 'manual'),
                    )),
                  ]),
                  const SizedBox(height: 16),

                  // ─── Scan Mode ────────────────────────────────────────
                  if (_mode == 'scan') ...[
                    if (_invoicePhotoUrl == null) ...[
                      // Camera prompt
                      GestureDetector(
                        onTap: _scanningInvoice ? null : _scanInvoice,
                        child: Container(
                          height: 160,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _scanningInvoice ? kPrimary.withOpacity(0.3) : kPrimary.withOpacity(0.5),
                              width: 2,
                              style: BorderStyle.solid,
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (_scanningInvoice)
                                const CircularProgressIndicator(color: kPrimary)
                              else ...[
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: kPrimaryLight,
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: const Icon(Icons.camera_alt_outlined, color: kPrimary, size: 30),
                                ),
                                const SizedBox(height: 12),
                                const Text('Tap to open camera',
                                    style: TextStyle(fontWeight: FontWeight.w600, color: kPrimary, fontSize: 15)),
                                const SizedBox(height: 4),
                                const Text('Take a photo of the invoice',
                                    style: TextStyle(color: kTextSecondary, fontSize: 12)),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ] else ...[
                      // Scanned invoice display
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8EAF6),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: kPrimary.withOpacity(0.2)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              const Icon(Icons.receipt_long_outlined, color: kPrimary, size: 20),
                              const SizedBox(width: 8),
                              const Text('Invoice Scanned',
                                  style: TextStyle(fontWeight: FontWeight.w700, color: kPrimary, fontSize: 14)),
                              const Spacer(),
                              GestureDetector(
                                onTap: _scanInvoice,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: kPrimary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(children: [
                                    Icon(Icons.refresh, color: kPrimary, size: 14),
                                    SizedBox(width: 4),
                                    Text('Rescan', style: TextStyle(color: kPrimary, fontSize: 12, fontWeight: FontWeight.w600)),
                                  ]),
                                ),
                              ),
                            ]),
                            if (_vendorName != null && _vendorName!.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text('Vendor: $_vendorName',
                                  style: const TextStyle(color: kTextSecondary, fontSize: 13)),
                            ],
                            const SizedBox(height: 12),
                            // Read-only product list
                            ..._products.asMap().entries.map((e) {
                              final idx = e.key;
                              final p = e.value;
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: kDivider),
                                ),
                                child: Row(children: [
                                  Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      color: kSecondary.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Center(
                                      child: Text('${idx + 1}',
                                          style: const TextStyle(fontWeight: FontWeight.w800, color: kSecondaryDark, fontSize: 12)),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(p.productCtrl.text,
                                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                        Text('${p.quantityCtrl.text} ${p.unit ?? ''} · ₹${p.priceCtrl.text}',
                                            style: const TextStyle(color: kTextSecondary, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                ]),
                              );
                            }),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        icon: const Icon(Icons.edit_outlined, size: 16),
                        label: const Text('Edit products manually'),
                        style: TextButton.styleFrom(foregroundColor: kPrimary),
                        onPressed: () => setState(() => _mode = 'manual'),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ],

                  // ─── Manual Mode ──────────────────────────────────────
                  if (_mode == 'manual') ...[
                    ...List.generate(_products.length, (i) => _buildProductCard(i)),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.add_circle_outline),
                      label: const Text('Add Another Product'),
                      onPressed: () => setState(() => _products.add(_ProductEntry())),
                    ),
                    const SizedBox(height: 8),
                  ],

                  // ─── Bill Photos Section ──────────────────────────────
                  if (_mode != 'none') ...[
                    const SizedBox(height: 16),
                    const Divider(height: 1, color: kDivider),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Add Bill Photo (Optional)',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: kTextPrimary)),
                        Text('${_billPhotoFiles.length}/10 photos added',
                            style: const TextStyle(
                                color: kTextSecondary, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (_billPhotoFiles.isNotEmpty) ...[
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                          childAspectRatio: 1,
                        ),
                        itemCount: _billPhotoFiles.length,
                        itemBuilder: (ctx, i) => Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.file(
                                File(_billPhotoFiles[i].path),
                                width: double.infinity,
                                height: double.infinity,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: GestureDetector(
                                onTap: () => setState(
                                    () => _billPhotoFiles.removeAt(i)),
                                child: Container(
                                  width: 22,
                                  height: 22,
                                  decoration: const BoxDecoration(
                                    color: kError,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close,
                                      color: Colors.white, size: 14),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                    if (_billPhotoFiles.length < 10)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _addBillPhoto,
                          icon: const Icon(Icons.camera_alt, size: 18),
                          label: const Text('Add Photo'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF6600),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                  ],

                  // ─── Submit ───────────────────────────────────────────
                  if (_mode != 'none') ...[
                    ElevatedButton.icon(
                      onPressed: _loading ? null : _submit,
                      icon: const Icon(Icons.send_rounded, size: 18),
                      label: _loading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Submit Survey'),
                    ),
                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(int index) {
    final p = _products[index];
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kDivider, width: 0.8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        children: [
          // Card header
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: kPrimaryLight,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Product ${index + 1}',
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: kPrimary)),
                if (_products.length > 1)
                  GestureDetector(
                    onTap: () =>
                        setState(() => _products.removeAt(index)),
                    child: const Icon(Icons.delete_outline,
                        color: kError, size: 20),
                  ),
              ],
            ),
          ),
          // Card body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _sectionLabel('PRODUCT NAME'),
                TextFormField(
                  controller: p.productCtrl,
                  decoration:
                      const InputDecoration(hintText: 'e.g. Sunflower Oil'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                _sectionLabel('BRAND'),
                TextFormField(
                  controller: p.brandCtrl,
                  decoration:
                      const InputDecoration(hintText: 'e.g. Fortune'),
                ),
                const SizedBox(height: 12),
                _sectionLabel('CATEGORY'),
                DropdownButtonFormField<String>(
                  value: p.category,
                  decoration:
                      const InputDecoration(hintText: 'Select category'),
                  items: categories
                      .map((c) =>
                          DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (v) => setState(() => p.category = v),
                  validator: (v) =>
                      v == null ? 'Please select category' : null,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _sectionLabel('MONTHLY QTY'),
                          TextFormField(
                            controller: p.quantityCtrl,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly
                            ],
                            decoration:
                                const InputDecoration(hintText: '0'),
                            onChanged: (_) => setState(() {}),
                            validator: (v) =>
                                v == null || v.trim().isEmpty
                                    ? 'Required'
                                    : null,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _sectionLabel('UNIT'),
                          DropdownButtonFormField<String>(
                            value: p.unit,
                            decoration:
                                const InputDecoration(hintText: 'Unit'),
                            items: units
                                .map((u) => DropdownMenuItem(
                                    value: u, child: Text(u)))
                                .toList(),
                            onChanged: (v) => setState(() => p.unit = v),
                            validator: (v) =>
                                v == null ? 'Select unit' : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (_annualQty(index) > 0) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8E1),
                      borderRadius: BorderRadius.circular(8),
                      border:
                          Border.all(color: kSecondary.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined,
                            size: 14, color: kSecondary),
                        const SizedBox(width: 6),
                        Text(
                          'Annual: ${_annualQty(index)} ${p.unit ?? ''}',
                          style: const TextStyle(
                              fontSize: 13,
                              color: kSecondaryDark,
                              fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                _sectionLabel('PRICE PER UNIT (₹)'),
                TextFormField(
                  controller: p.priceCtrl,
                  keyboardType: const TextInputType.numberWithOptions(
                      decimal: true),
                  decoration: const InputDecoration(
                      hintText: '0.00', prefixText: '₹ '),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Required' : null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Mode Toggle Button ────────────────────────────────────────────────────
class _ModeButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ModeButton({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: selected ? kPrimary : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? kPrimary : kDivider,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [BoxShadow(color: kPrimary.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 3))]
              : [],
        ),
        child: Column(
          children: [
            Icon(icon, color: selected ? Colors.white : kTextSecondary, size: 26),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: selected ? Colors.white : kTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Surveys List ──────────────────────────────────────────────────────────
class SurveysListScreen extends StatefulWidget {
  const SurveysListScreen({super.key});

  @override
  State<SurveysListScreen> createState() => _SurveysListScreenState();
}

class _SurveysListScreenState extends State<SurveysListScreen> {
  List<dynamic> _entities = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchEntities();
  }

  Future<void> _fetchEntities() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/survey/entities'),
        headers: _headers,
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200) {
        setState(() {
          _entities = body['data'] ??
              body['entities'] ??
              (body is List ? body : []);
          _loading = false;
        });
      } else {
        setState(() {
          _error = body['message'] ?? 'Failed to load surveys';
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Network error';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('All Surveys'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _fetchEntities,
          )
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi_off_rounded,
                            size: 56, color: kTextSecondary),
                        const SizedBox(height: 16),
                        Text(_error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: kTextSecondary, fontSize: 15)),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: _fetchEntities,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _entities.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.inbox_outlined,
                              size: 64, color: kTextSecondary),
                          SizedBox(height: 16),
                          Text('No surveys yet',
                              style: TextStyle(
                                  color: kTextSecondary, fontSize: 16)),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      color: kSecondary,
                      onRefresh: _fetchEntities,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _entities.length,
                        itemBuilder: (context, index) {
                          final e = _entities[index];
                          final entityType =
                              e['entity_type']?.toString() ?? '';
                          final district =
                              e['district']?.toString() ?? '';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: kDivider, width: 0.8),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.04),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ],
                            ),
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 46,
                                  height: 46,
                                  decoration: BoxDecoration(
                                    color: kPrimaryLight,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.store_outlined,
                                      color: kPrimary, size: 24),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        e['entity_name'] ?? 'Unknown',
                                        style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                            color: kTextPrimary),
                                      ),
                                      if ((e['owner_name'] ?? '')
                                          .isNotEmpty) ...[
                                        const SizedBox(height: 3),
                                        Text(e['owner_name'],
                                            style: const TextStyle(
                                                fontSize: 13,
                                                color: kTextSecondary)),
                                      ],
                                      const SizedBox(height: 8),
                                      Row(children: [
                                        if (entityType.isNotEmpty)
                                          Container(
                                            padding:
                                                const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 3),
                                            decoration: BoxDecoration(
                                              color: kPrimaryLight,
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                            ),
                                            child: Text(entityType,
                                                style: const TextStyle(
                                                    fontSize: 11,
                                                    color: kPrimary,
                                                    fontWeight:
                                                        FontWeight.w700)),
                                          ),
                                        if (entityType.isNotEmpty &&
                                            district.isNotEmpty)
                                          const SizedBox(width: 8),
                                        if (district.isNotEmpty)
                                          Row(children: [
                                            const Icon(
                                                Icons.location_on_outlined,
                                                size: 13,
                                                color: kTextSecondary),
                                            const SizedBox(width: 3),
                                            Text(district,
                                                style: const TextStyle(
                                                    fontSize: 12,
                                                    color: kTextSecondary)),
                                          ]),
                                      ]),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

// ─── My Surveys ────────────────────────────────────────────────────────────
class MySurveysScreen extends StatefulWidget {
  const MySurveysScreen({super.key});
  @override
  State<MySurveysScreen> createState() => _MySurveysScreenState();
}

class _MySurveysScreenState extends State<MySurveysScreen> {
  List<dynamic> _surveys = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/survey/my-surveys'),
        headers: _headers,
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200) {
        setState(() { _surveys = body['data'] ?? []; _loading = false; });
      } else {
        setState(() { _error = body['message'] ?? 'Failed to load'; _loading = false; });
      }
    } catch (e) {
      if (mounted) setState(() { _error = 'Network error'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Surveys')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.error_outline, color: kError, size: 40),
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: kError)),
                  const SizedBox(height: 16),
                  TextButton(onPressed: _fetch, child: const Text('Retry')),
                ]))
              : _surveys.isEmpty
                  ? const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.history_rounded, size: 56, color: kDivider),
                      SizedBox(height: 12),
                      Text('No surveys submitted yet', style: TextStyle(color: kTextSecondary)),
                    ]))
                  : RefreshIndicator(
                      onRefresh: _fetch,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _surveys.length,
                        itemBuilder: (ctx, i) {
                          final s = _surveys[i];
                          final products = (s['products'] as List?) ?? [];
                          final photoUrl = s['invoice_photo_url'] as String?;
                          final date = s['survey_date'] != null
                              ? DateTime.tryParse(s['survey_date'])
                              : null;
                          final dateStr = date != null
                              ? '${date.day}/${date.month}/${date.year}'
                              : '—';

                          return GestureDetector(
                            onTap: () => Navigator.push(context,
                                MaterialPageRoute(builder: (_) => SurveyDetailScreen(survey: s))),
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: kDivider, width: 0.8),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    // Invoice thumbnail or icon
                                    Container(
                                      width: 56,
                                      height: 56,
                                      decoration: BoxDecoration(
                                        color: kPrimaryLight,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: photoUrl != null
                                          ? ClipRRect(
                                              borderRadius: BorderRadius.circular(12),
                                              child: Image.network(
                                                'https://sita-backend-whn2.onrender.com$photoUrl',
                                                fit: BoxFit.cover,
                                                errorBuilder: (_, __, ___) =>
                                                    const Icon(Icons.receipt_long_outlined, color: kPrimary, size: 28),
                                              ),
                                            )
                                          : const Icon(Icons.store_outlined, color: kPrimary, size: 28),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(children: [
                                            Expanded(
                                              child: Text(s['entity_name'] ?? '—',
                                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: kPrimaryLight,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(s['entity_type'] ?? '',
                                                  style: const TextStyle(fontSize: 11, color: kPrimary, fontWeight: FontWeight.w700)),
                                            ),
                                          ]),
                                          const SizedBox(height: 4),
                                          Row(children: [
                                            const Icon(Icons.calendar_today_outlined, size: 12, color: kTextSecondary),
                                            const SizedBox(width: 4),
                                            Text(dateStr, style: const TextStyle(fontSize: 12, color: kTextSecondary)),
                                            const SizedBox(width: 12),
                                            const Icon(Icons.inventory_2_outlined, size: 12, color: kTextSecondary),
                                            const SizedBox(width: 4),
                                            Text('${products.length} products',
                                                style: const TextStyle(fontSize: 12, color: kTextSecondary)),
                                          ]),
                                          const SizedBox(height: 4),
                                          Row(children: [
                                            Container(
                                              width: 8, height: 8,
                                              decoration: const BoxDecoration(color: kSuccess, shape: BoxShape.circle),
                                            ),
                                            const SizedBox(width: 6),
                                            const Text('Synced',
                                                style: TextStyle(fontSize: 11, color: kSuccess, fontWeight: FontWeight.w600)),
                                          ]),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.chevron_right_rounded, color: kTextSecondary),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

// ─── Survey Detail ─────────────────────────────────────────────────────────
class SurveyDetailScreen extends StatelessWidget {
  final Map<String, dynamic> survey;
  const SurveyDetailScreen({super.key, required this.survey});

  @override
  Widget build(BuildContext context) {
    final products = (survey['products'] as List?) ?? [];
    final photoUrl = survey['invoice_photo_url'] as String?;
    final date = survey['survey_date'] != null
        ? DateTime.tryParse(survey['survey_date'])
        : null;
    final dateStr = date != null ? '${date.day}/${date.month}/${date.year}' : '—';

    return Scaffold(
      appBar: AppBar(title: Text(survey['entity_name'] ?? 'Survey Detail')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Entity details card
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kDivider, width: 0.8),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Icon(Icons.store_outlined, color: kPrimary, size: 18),
                  const SizedBox(width: 8),
                  const Text('Entity Details',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: kPrimary)),
                ]),
                const SizedBox(height: 12),
                _detailRow('Name', survey['entity_name'] ?? '—'),
                _detailRow('Type', survey['entity_type'] ?? '—'),
                _detailRow('Owner', survey['owner_name'] ?? '—'),
                _detailRow('District', '${survey['district'] ?? '—'}${survey['taluka'] != null ? ', ${survey['taluka']}' : ''}'),
                _detailRow('Address', survey['address'] ?? '—'),
                _detailRow('Survey Date', dateStr),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Invoice photo
          if (photoUrl != null) ...[
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: kDivider, width: 0.8),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(children: [
                    Icon(Icons.receipt_long_outlined, color: kPrimary, size: 18),
                    SizedBox(width: 8),
                    Text('Invoice Photo',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: kPrimary)),
                  ]),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      'https://sita-backend-whn2.onrender.com$photoUrl',
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 120,
                        color: kPrimaryLight,
                        child: const Center(child: Text('Image unavailable', style: TextStyle(color: kTextSecondary))),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Products
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kDivider, width: 0.8),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Icon(Icons.inventory_2_outlined, color: kPrimary, size: 18),
                  const SizedBox(width: 8),
                  Text('Products (${products.length})',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: kPrimary)),
                ]),
                const SizedBox(height: 12),
                if (products.isEmpty)
                  const Text('No products recorded.', style: TextStyle(color: kTextSecondary))
                else
                  ...products.asMap().entries.map((e) {
                    final idx = e.key;
                    final p = e.value as Map<String, dynamic>;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: kBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: kDivider),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            Container(
                              width: 24, height: 24,
                              decoration: BoxDecoration(color: kSecondary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                              child: Center(child: Text('${idx + 1}',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: kSecondaryDark))),
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Text(p['product_name'] ?? '—',
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
                            if (p['category'] != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: kPrimaryLight, borderRadius: BorderRadius.circular(6)),
                                child: Text(p['category'],
                                    style: const TextStyle(fontSize: 10, color: kPrimary, fontWeight: FontWeight.w700)),
                              ),
                          ]),
                          if (p['brand'] != null && p['brand'].toString().isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text('Brand: ${p['brand']}', style: const TextStyle(fontSize: 12, color: kTextSecondary)),
                          ],
                          const SizedBox(height: 8),
                          Row(children: [
                            _productStat('Monthly', '${p['monthly_quantity']} ${p['unit'] ?? ''}'),
                            const SizedBox(width: 16),
                            _productStat('Annual', '${p['annual_quantity']} ${p['unit'] ?? ''}'),
                            const SizedBox(width: 16),
                            _productStat('Price', '₹${p['price_per_unit']}/${p['unit'] ?? 'unit'}'),
                          ]),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 80, child: Text(label,
              style: const TextStyle(fontSize: 12, color: kTextSecondary, fontWeight: FontWeight.w600))),
          const SizedBox(width: 8),
          Expanded(child: Text(value,
              style: const TextStyle(fontSize: 13, color: kTextPrimary, fontWeight: FontWeight.w500))),
        ]),
      );

  Widget _productStat(String label, String value) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: kTextSecondary, fontWeight: FontWeight.w600)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: kTextPrimary)),
        ],
      );
}
