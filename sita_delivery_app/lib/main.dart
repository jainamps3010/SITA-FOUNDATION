import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

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

// ─── Theme ─────────────────────────────────────────────────────────────────
ThemeData get appTheme => ThemeData(
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
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(
              fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 0.4),
          elevation: 0,
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
        hintStyle: const TextStyle(color: kTextSecondary, fontSize: 14),
        labelStyle: const TextStyle(color: kTextSecondary),
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
    );

// ─── Main ──────────────────────────────────────────────────────────────────
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(MaterialApp(
    title: 'SITA Delivery',
    debugShowCheckedModeBanner: false,
    theme: appTheme,
    home: const SplashScreen(),
  ));
}

// ─── Splash ────────────────────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800))
      ..forward();
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [kPrimaryDark, kPrimary, Color(0xFF283593)],
          ),
        ),
        child: FadeTransition(
          opacity: _fade,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),
                Container(
                  width: 130,
                  height: 130,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.25),
                        blurRadius: 28,
                        offset: const Offset(0, 10),
                      )
                    ],
                  ),
                  child: ClipOval(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Image.asset('assets/logo.png',
                          height: 100, fit: BoxFit.contain),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'SITA Foundation',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                const Text(
                  'DELIVERY APP',
                  style: TextStyle(
                      color: Color(0xFFFFB300),
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 4),
                ),
                const Spacer(),
                const CircularProgressIndicator(
                    color: kSecondary, strokeWidth: 2.5),
                const SizedBox(height: 20),
                const Text('Loading...',
                    style: TextStyle(color: Colors.white38, fontSize: 12)),
                const SizedBox(height: 48),
              ],
            ),
          ),
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
  final _phoneController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length != 10) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mobile': phone}),
      );
      if (res.statusCode == 200) {
        if (mounted) {
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)));
        }
      } else {
        setState(() => _error = 'Failed to send OTP. Please try again.');
      }
    } catch (e) {
      setState(() => _error = 'Network error. Check your connection.');
    } finally {
      setState(() => _loading = false);
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
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
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
                    const SizedBox(height: 20),
                    const Text(
                      'Delivery Partner Login',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'SITA Foundation · Delivery App',
                      style: TextStyle(color: Colors.white60, fontSize: 13),
                    ),
                  ],
                ),
              ),

              // Form
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    const Text('Mobile Number',
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: kTextPrimary)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      decoration: const InputDecoration(
                        hintText: 'Enter 10-digit mobile number',
                        prefixText: '+91  ',
                        prefixStyle: TextStyle(
                            color: kTextPrimary, fontWeight: FontWeight.w600),
                        counterText: '',
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEBEE),
                          borderRadius: BorderRadius.circular(10),
                          border:
                              Border.all(color: kError.withOpacity(0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline,
                                color: kError, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                                child: Text(_error!,
                                    style: const TextStyle(
                                        color: kError, fontSize: 13))),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 28),
                    ElevatedButton(
                      onPressed: _loading ? null : _sendOtp,
                      child: _loading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2))
                          : const Text('Send OTP'),
                    ),
                    const SizedBox(height: 24),
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
                          Icon(Icons.local_shipping_outlined,
                              color: kPrimary, size: 20),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'This app is exclusively for SITA Foundation delivery partners. Contact your coordinator for access.',
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
  final _otpController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mobile': widget.phone, 'otp': otp}),
      );
      if (res.statusCode == 200) {
        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const DeliveriesScreen()),
            (_) => false,
          );
        }
      } else {
        setState(() => _error = 'Invalid OTP. Please try again.');
      }
    } catch (e) {
      setState(() => _error = 'Network error. Please try again.');
    } finally {
      setState(() => _loading = false);
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
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: kPrimaryLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: kPrimary.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.sms_outlined, color: kPrimary, size: 24),
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
              const Text('Enter OTP',
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: kTextPrimary)),
              const SizedBox(height: 8),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: 8),
                decoration: const InputDecoration(
                  hintText: '------',
                  hintStyle: TextStyle(letterSpacing: 8),
                  counterText: '',
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 10),
                Text(_error!,
                    style: const TextStyle(color: kError, fontSize: 13)),
              ],
              const SizedBox(height: 28),
              ElevatedButton(
                onPressed: _loading ? null : _verifyOtp,
                child: _loading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : const Text('Verify & Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Deliveries ────────────────────────────────────────────────────────────
class DeliveriesScreen extends StatefulWidget {
  const DeliveriesScreen({super.key});

  @override
  State<DeliveriesScreen> createState() => _DeliveriesScreenState();
}

class _DeliveriesScreenState extends State<DeliveriesScreen> {
  List<dynamic> _orders = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await http.get(Uri.parse('$baseUrl/delivery/orders'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(
            () => _orders = data is List ? data : (data['orders'] ?? []));
      } else {
        setState(() => _error = 'Failed to load orders.');
      }
    } catch (e) {
      setState(() => _error = 'Network error. Please try again.');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _cancelDelivery(dynamic order) async {
    final orderId = order['id'] ?? order['_id'] ?? order['order_id'];
    final memberName = order['member_name']?.toString() ??
        order['memberName']?.toString() ??
        'this order';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Delivery',
            style: TextStyle(fontWeight: FontWeight.w700)),
        content: Text(
          'Are you sure you want to cancel the delivery for $memberName? '
          'The order will be returned to pending.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('No, Keep It'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: kError),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/delivery/cancel'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'order_id': orderId}),
      );
      if (!mounted) return;
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery cancelled. Order returned to pending.'),
            backgroundColor: kSuccess,
          ),
        );
        _fetchOrders();
      } else {
        final body = jsonDecode(res.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(body['message']?.toString() ?? 'Cancellation failed.'),
            backgroundColor: kError,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Network error. Please try again.'),
          backgroundColor: kError,
        ),
      );
    }
  }

  Color _statusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return kSuccess;
      case 'pending':
        return kSecondary;
      case 'assigned':
        return kPrimary;
      case 'cancelled':
        return kError;
      default:
        return kTextSecondary;
    }
  }

  Color _statusBg(String? status) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return const Color(0xFFE0F2F1);
      case 'pending':
        return const Color(0xFFFFF8E1);
      case 'assigned':
        return kPrimaryLight;
      case 'cancelled':
        return const Color(0xFFFFEBEE);
      default:
        return const Color(0xFFF5F5F5);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Deliveries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchOrders,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi_off_rounded,
                            size: 56, color: kTextSecondary),
                        const SizedBox(height: 16),
                        Text(_error!,
                            style: const TextStyle(
                                color: kTextSecondary, fontSize: 15),
                            textAlign: TextAlign.center),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: _fetchOrders,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _orders.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.local_shipping_outlined,
                              size: 64, color: kTextSecondary),
                          SizedBox(height: 16),
                          Text('No deliveries assigned',
                              style: TextStyle(
                                  color: kTextSecondary, fontSize: 16)),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      color: kSecondary,
                      onRefresh: _fetchOrders,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length,
                        itemBuilder: (context, index) {
                          final order = _orders[index];
                          final status =
                              order['status']?.toString() ?? 'pending';
                          final memberName =
                              order['member_name']?.toString() ??
                                  order['memberName']?.toString() ??
                                  'Unknown Member';
                          final address =
                              order['delivery_address']?.toString() ??
                                  order['deliveryAddress']?.toString() ??
                                  'No address';
                          final amount =
                              order['total_amount']?.toString() ??
                                  order['totalAmount']?.toString() ??
                                  '0';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: kDivider, width: 1),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 2),
                                )
                              ],
                            ),
                            child: Column(
                              children: [
                                // Status bar
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _statusBg(status),
                                    borderRadius: const BorderRadius.only(
                                      topLeft: Radius.circular(16),
                                      topRight: Radius.circular(16),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        memberName,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 15,
                                            color: kTextPrimary),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: _statusColor(status),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          status.toUpperCase(),
                                          style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Body
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    children: [
                                      _infoRow(
                                          Icons.location_on_outlined,
                                          address),
                                      const SizedBox(height: 8),
                                      _infoRow(
                                          Icons.currency_rupee,
                                          '₹$amount'),
                                      const SizedBox(height: 14),
                                      SizedBox(
                                        width: double.infinity,
                                        child: ElevatedButton.icon(
                                          onPressed: () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) =>
                                                    ConfirmDeliveryScreen(
                                                        order: order),
                                              ),
                                            ).then((_) => _fetchOrders());
                                          },
                                          icon: const Icon(
                                              Icons.check_circle_outline,
                                              size: 18),
                                          label: const Text(
                                              'Confirm Delivery'),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      SizedBox(
                                        width: double.infinity,
                                        child: OutlinedButton.icon(
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: kError,
                                            side: const BorderSide(color: kError),
                                            minimumSize: const Size(
                                                double.infinity, 46),
                                            shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(12)),
                                          ),
                                          onPressed: () =>
                                              _cancelDelivery(order),
                                          icon: const Icon(
                                              Icons.cancel_outlined,
                                              size: 18),
                                          label: const Text('Cancel Delivery',
                                              style: TextStyle(
                                                  fontWeight:
                                                      FontWeight.w700)),
                                        ),
                                      ),
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

  Widget _infoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: kTextSecondary),
        const SizedBox(width: 8),
        Expanded(
            child: Text(text,
                style: const TextStyle(
                    color: kTextSecondary, fontSize: 13))),
      ],
    );
  }
}

// ─── Confirm Delivery ──────────────────────────────────────────────────────
class ConfirmDeliveryScreen extends StatefulWidget {
  final Map<String, dynamic> order;
  const ConfirmDeliveryScreen({super.key, required this.order});

  @override
  State<ConfirmDeliveryScreen> createState() =>
      _ConfirmDeliveryScreenState();
}

class _ConfirmDeliveryScreenState extends State<ConfirmDeliveryScreen> {
  final _otpController = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;

  Future<void> _confirmDelivery() async {
    final otp = _otpController.text.trim();
    if (otp.isEmpty) {
      setState(() => _error = 'Please enter the OTP from the member.');
      return;
    }
    final orderId = widget.order['id'] ??
        widget.order['_id'] ??
        widget.order['order_id'];
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
    });
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/delivery/confirm'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'order_id': orderId, 'otp': otp}),
      );
      if (res.statusCode == 200) {
        setState(() => _success = 'Delivery confirmed successfully!');
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.pop(context);
      } else {
        final body = jsonDecode(res.body);
        setState(() =>
            _error = body['message']?.toString() ?? 'Confirmation failed.');
      }
    } catch (e) {
      setState(() => _error = 'Network error. Please try again.');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final memberName = order['member_name']?.toString() ??
        order['memberName']?.toString() ??
        'Unknown Member';
    final address = order['delivery_address']?.toString() ??
        order['deliveryAddress']?.toString() ??
        'No address';
    final amount = order['total_amount']?.toString() ??
        order['totalAmount']?.toString() ??
        '0';
    final status = order['status']?.toString() ?? 'pending';

    return Scaffold(
      appBar: AppBar(title: const Text('Confirm Delivery')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order details card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: kDivider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Order Details',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: kPrimary)),
                  const SizedBox(height: 16),
                  _detailRow(Icons.person_outline, 'Member', memberName),
                  const Divider(height: 20, color: kDivider),
                  _detailRow(
                      Icons.location_on_outlined, 'Address', address),
                  const Divider(height: 20, color: kDivider),
                  _detailRow(
                      Icons.currency_rupee, 'Amount', '₹$amount'),
                  const Divider(height: 20, color: kDivider),
                  _detailRow(Icons.info_outline, 'Status',
                      status.toUpperCase()),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Photo capture
            const Text('Delivery Photo',
                style: TextStyle(
                    fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Camera feature coming soon')),
              ),
              child: Container(
                width: double.infinity,
                height: 160,
                decoration: BoxDecoration(
                  color: kPrimaryLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: kPrimary.withOpacity(0.3),
                      style: BorderStyle.solid),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt_outlined,
                        size: 48, color: kPrimary),
                    SizedBox(height: 8),
                    Text('Tap to Take Photo',
                        style: TextStyle(
                            color: kPrimary,
                            fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // OTP
            const Text('Delivery OTP',
                style: TextStyle(
                    fontSize: 15, fontWeight: FontWeight.w700)),
            const Text(
              'Ask the member for their delivery OTP',
              style: TextStyle(color: kTextSecondary, fontSize: 13),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 8),
              decoration: const InputDecoration(
                hintText: '------',
                hintStyle: TextStyle(letterSpacing: 8),
                counterText: '',
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFEBEE),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kError.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline,
                        color: kError, size: 18),
                    const SizedBox(width: 8),
                    Text(_error!,
                        style: const TextStyle(color: kError, fontSize: 13)),
                  ],
                ),
              ),
            ],
            if (_success != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFE0F2F1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kSuccess.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline,
                        color: kSuccess, size: 18),
                    const SizedBox(width: 8),
                    Text(_success!,
                        style:
                            const TextStyle(color: kSuccess, fontSize: 13)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loading ? null : _confirmDelivery,
              icon: const Icon(Icons.check_circle_outline, size: 20),
              label: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Confirm Delivery'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: kPrimary),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 11,
                    color: kTextSecondary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5)),
            Text(value,
                style: const TextStyle(
                    fontSize: 14,
                    color: kTextPrimary,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    );
  }
}
