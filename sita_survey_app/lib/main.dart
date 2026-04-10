import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

const baseUrl = 'http://10.0.2.2:3000/api/v1';

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
      home: const LoginScreen(),
    );
  }
}

// ─── Session ───────────────────────────────────────────────────────────────
class Session {
  static String? token;
  static String? agentName;
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
      showSnack(context, 'Enter a valid 10-digit mobile number',
          error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/send-otp'),
        headers: _headers,
        body: jsonEncode({'phone': phone}),
      );
      final body = jsonDecode(res.body);
      if (!mounted) return;
      if (res.statusCode == 200) {
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)));
      } else {
        showSnack(context, body['message'] ?? 'Failed to send OTP',
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
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
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

// ─── Home ──────────────────────────────────────────────────────────────────
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SITA Survey'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Logout',
            onPressed: () {
              Session.token = null;
              Session.agentName = null;
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
        ],
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
                                        hintText: 'e.g. Ahmedabad'),
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

  static const categories = ['Oils', 'Grains', 'Spices', 'Gas', 'Cleaning'];
  static const units = ['Kg', 'Liters', 'Bags', 'Cylinders'];

  int _annualQty(int index) {
    return (int.tryParse(_products[index].quantityCtrl.text) ?? 0) * 12;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    for (int i = 0; i < _products.length; i++) {
      final p = _products[i];
      if (p.category == null) {
        showSnack(context, 'Select category for product ${i + 1}',
            error: true);
        return;
      }
      if (p.unit == null) {
        showSnack(context, 'Select unit for product ${i + 1}',
            error: true);
        return;
      }
    }
    setState(() => _loading = true);
    try {
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
                  if (widget.entityId != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2F1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                            color: kSuccess.withOpacity(0.4)),
                      ),
                      child: Row(children: [
                        const Icon(Icons.check_circle_outline,
                            color: kSuccess, size: 18),
                        const SizedBox(width: 8),
                        Text('Entity ID: ${widget.entityId}',
                            style: const TextStyle(
                                color: kSuccess,
                                fontWeight: FontWeight.w600,
                                fontSize: 13)),
                      ]),
                    ),
                  ...List.generate(
                      _products.length, (i) => _buildProductCard(i)),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    icon: const Icon(Icons.add_circle_outline),
                    label: const Text('Add Another Product'),
                    onPressed: () =>
                        setState(() => _products.add(_ProductEntry())),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _loading ? null : _submit,
                    icon: const Icon(Icons.send_rounded, size: 18),
                    label: _loading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Submit Survey'),
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
