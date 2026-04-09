import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const baseUrl = 'http://10.0.2.2:3000/api/v1';
const primaryGreen = Color(0xFF2E7D32);
const lightGreen = Color(0xFF4CAF50);
const bgColor = Color(0xFFF1F8E9);

void main() {
  runApp(const SitaSurveyApp());
}

// ─── App ───────────────────────────────────────────────────────────────────────

class SitaSurveyApp extends StatelessWidget {
  const SitaSurveyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SITA Survey',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryGreen,
          primary: primaryGreen,
          secondary: lightGreen,
          surface: Colors.white,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: bgColor,
        appBarTheme: const AppBarTheme(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          elevation: 2,
          centerTitle: true,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryGreen,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 50),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10)),
            textStyle:
                const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFCCCCCC)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFCCCCCC)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: primaryGreen, width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          labelStyle: const TextStyle(color: Colors.grey),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}

// ─── Session ───────────────────────────────────────────────────────────────────

class Session {
  static String? token;
  static String? agentName;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

Map<String, String> get _headers => {
      'Content-Type': 'application/json',
      if (Session.token != null) 'Authorization': 'Bearer ${Session.token}',
    };

void showSnack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(msg),
    backgroundColor: error ? Colors.red[700] : primaryGreen,
    behavior: SnackBarBehavior.floating,
  ));
}

Widget _buildCard({required Widget child}) => Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: child,
      ),
    );

Widget _sectionLabel(String text) => Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text,
          style: const TextStyle(
              fontSize: 13,
              color: Colors.grey,
              fontWeight: FontWeight.w600)),
    );

// ─── LoginScreen ──────────────────────────────────────────────────────────────

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
      if (mounted) showSnack(context, 'Network error: $e', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: primaryGreen,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.poll_rounded,
                      size: 52, color: Colors.white),
                ),
                const SizedBox(height: 24),
                const Text('SITA Survey',
                    style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: primaryGreen)),
                const SizedBox(height: 6),
                const Text('Field Agent Portal',
                    style: TextStyle(fontSize: 15, color: Colors.grey)),
                const SizedBox(height: 36),
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _sectionLabel('MOBILE NUMBER'),
                      TextField(
                        controller: _phoneCtrl,
                        keyboardType: TextInputType.phone,
                        maxLength: 10,
                        decoration: const InputDecoration(
                          hintText: 'Enter 10-digit mobile number',
                          prefixIcon: Icon(Icons.phone, color: primaryGreen),
                          counterText: '',
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loading ? null : _sendOtp,
                        child: _loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white))
                            : const Text('Send OTP'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── OtpScreen ────────────────────────────────────────────────────────────────

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
        Session.token = body['token'] ??
            body['data']?['token'];
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
      if (mounted) showSnack(context, 'Network error: $e', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: _buildCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.lock_outline, size: 48, color: primaryGreen),
                const SizedBox(height: 12),
                Text(
                  'OTP sent to ${widget.phone}',
                  style: const TextStyle(fontSize: 16, color: Colors.grey),
                ),
                const SizedBox(height: 20),
                _sectionLabel('ENTER OTP'),
                TextField(
                  controller: _otpCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  style: const TextStyle(
                      letterSpacing: 8,
                      fontSize: 22,
                      fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    hintText: '------',
                    hintStyle: TextStyle(letterSpacing: 8),
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _loading ? null : _verifyOtp,
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Verify OTP'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SITA Survey'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
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
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCard(
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: primaryGreen.withAlpha(20),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.person,
                        color: primaryGreen, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Welcome back,',
                          style:
                              TextStyle(color: Colors.grey, fontSize: 13)),
                      Text(
                        Session.agentName ?? 'Agent',
                        style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: primaryGreen),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text('Actions',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87)),
            const SizedBox(height: 16),
            _HomeActionCard(
              icon: Icons.add_circle_outline_rounded,
              title: 'Start New Survey',
              subtitle: 'Record a new entity & consumption data',
              onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const NewSurveyScreen())),
            ),
            const SizedBox(height: 12),
            _HomeActionCard(
              icon: Icons.list_alt_rounded,
              title: 'View All Surveys',
              subtitle: 'Browse all submitted entities',
              onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const SurveysListScreen())),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _HomeActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Card(
        elevation: 3,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: primaryGreen.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: primaryGreen, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 3),
                    Text(subtitle,
                        style: const TextStyle(
                            fontSize: 13, color: Colors.grey)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── NewSurveyScreen ──────────────────────────────────────────────────────────

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
      if (mounted) showSnack(context, 'Network error: $e', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Survey')),
      body: Form(
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
                          fontWeight: FontWeight.bold,
                          color: primaryGreen)),
                  const SizedBox(height: 16),
                  _sectionLabel('ENTITY NAME'),
                  TextFormField(
                    controller: _entityNameCtrl,
                    decoration: const InputDecoration(
                        hintText: 'e.g. Hotel Sunrise'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  _sectionLabel('OWNER NAME'),
                  TextFormField(
                    controller: _ownerNameCtrl,
                    decoration: const InputDecoration(
                        hintText: 'e.g. Ramesh Patel'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  _sectionLabel('MOBILE'),
                  TextFormField(
                    controller: _mobileCtrl,
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    decoration: const InputDecoration(
                        hintText: '10-digit mobile', counterText: ''),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Required';
                      if (v.trim().length != 10) return 'Enter 10 digits';
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
                        .map((t) =>
                            DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                    onChanged: (v) => setState(() => _entityType = v),
                    validator: (v) =>
                        v == null ? 'Please select entity type' : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _buildCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Location',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: primaryGreen)),
                  const SizedBox(height: 16),
                  _sectionLabel('ADDRESS'),
                  TextFormField(
                    controller: _addressCtrl,
                    maxLines: 2,
                    decoration:
                        const InputDecoration(hintText: 'Full address'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  _sectionLabel('DISTRICT'),
                  TextFormField(
                    controller: _districtCtrl,
                    decoration:
                        const InputDecoration(hintText: 'e.g. Ahmedabad'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 14),
                  _sectionLabel('TALUKA'),
                  TextFormField(
                    controller: _talukaCtrl,
                    decoration:
                        const InputDecoration(hintText: 'e.g. Daskroi'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Next: Add Consumption Data'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ─── ConsumptionScreen ────────────────────────────────────────────────────────

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
    final v = int.tryParse(_products[index].quantityCtrl.text) ?? 0;
    return v * 12;
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
        showSnack(context, 'Select unit for product ${i + 1}', error: true);
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
      if (mounted) showSnack(context, 'Network error: $e', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Consumption Data')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (widget.entityId != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: lightGreen.withAlpha(30),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: lightGreen),
                ),
                child: Row(children: [
                  const Icon(Icons.check_circle,
                      color: primaryGreen, size: 18),
                  const SizedBox(width: 8),
                  Text('Entity ID: ${widget.entityId}',
                      style: const TextStyle(
                          color: primaryGreen,
                          fontWeight: FontWeight.w600)),
                ]),
              ),
            ...List.generate(
                _products.length, (i) => _buildProductCard(i)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              icon: const Icon(Icons.add, color: primaryGreen),
              label: const Text('Add More Products',
                  style: TextStyle(color: primaryGreen)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: primaryGreen),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () =>
                  setState(() => _products.add(_ProductEntry())),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
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
    );
  }

  Widget _buildProductCard(int index) {
    final p = _products[index];
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14)),
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Product ${index + 1}',
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: primaryGreen)),
                  if (_products.length > 1)
                    IconButton(
                      icon: const Icon(Icons.delete_outline,
                          color: Colors.red),
                      onPressed: () =>
                          setState(() => _products.removeAt(index)),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              _sectionLabel('PRODUCT NAME'),
              TextFormField(
                controller: p.productCtrl,
                decoration: const InputDecoration(
                    hintText: 'e.g. Sunflower Oil'),
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
                          decoration:
                              const InputDecoration(hintText: '0'),
                          onChanged: (_) => setState(() {}),
                          validator: (v) => v == null || v.trim().isEmpty
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
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 14, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(
                      'Annual Quantity: ${_annualQty(index)} ${p.unit ?? ''}',
                      style: const TextStyle(
                          fontSize: 13, color: Colors.grey),
                    ),
                  ],
                ),
              ),
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
      ),
    );
  }
}

// ─── SurveysListScreen ────────────────────────────────────────────────────────

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
          _entities =
              body['data'] ?? body['entities'] ?? (body is List ? body : []);
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
          _error = 'Network error: $e';
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
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: _fetchEntities,
          )
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: primaryGreen))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline,
                            size: 60, color: Colors.red),
                        const SizedBox(height: 12),
                        Text(_error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.grey)),
                        const SizedBox(height: 16),
                        ElevatedButton(
                            onPressed: _fetchEntities,
                            child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : _entities.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.inbox_outlined,
                              size: 70, color: Colors.grey),
                          SizedBox(height: 12),
                          Text('No surveys yet',
                              style: TextStyle(
                                  fontSize: 16, color: Colors.grey)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _entities.length,
                      itemBuilder: (context, index) {
                        final e = _entities[index];
                        final entityType = e['entity_type'] ?? '';
                        final district = e['district'] ?? '';
                        return Card(
                          elevation: 2,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          color: Colors.white,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: primaryGreen.withAlpha(20),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.store_outlined,
                                      color: primaryGreen, size: 24),
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
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black87),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        e['owner_name'] ?? '',
                                        style: const TextStyle(
                                            fontSize: 13,
                                            color: Colors.black54),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          if (entityType.isNotEmpty)
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 3),
                                              decoration: BoxDecoration(
                                                color:
                                                    lightGreen.withAlpha(30),
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                                border: Border.all(
                                                    color: lightGreen
                                                        .withAlpha(100)),
                                              ),
                                              child: Text(
                                                entityType,
                                                style: const TextStyle(
                                                    fontSize: 11,
                                                    color: primaryGreen,
                                                    fontWeight:
                                                        FontWeight.w600),
                                              ),
                                            ),
                                          if (entityType.isNotEmpty &&
                                              district.isNotEmpty)
                                            const SizedBox(width: 8),
                                          if (district.isNotEmpty)
                                            Row(children: [
                                              const Icon(
                                                  Icons.location_on_outlined,
                                                  size: 13,
                                                  color: Colors.grey),
                                              const SizedBox(width: 3),
                                              Text(
                                                district,
                                                style: const TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey),
                                              ),
                                            ]),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
