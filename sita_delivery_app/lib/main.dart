import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const baseUrl = 'http://10.0.2.2:3000/api/v1';

void main() {
  runApp(const MaterialApp(home: LoginScreen()));
}

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
    if (phone.isEmpty) return;

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
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)),
          );
        }
      } else {
        setState(() => _error = 'Failed to send OTP. Please try again.');
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
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _sendOtp,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Send OTP'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

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
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('OTP sent to ${widget.phone}'),
            const SizedBox(height: 16),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Enter OTP',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _verifyOtp,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Verify'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

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
        setState(() => _orders = data is List ? data : (data['orders'] ?? []));
      } else {
        setState(() => _error = 'Failed to load orders.');
      }
    } catch (e) {
      setState(() => _error = 'Network error. Please try again.');
    } finally {
      setState(() => _loading = false);
    }
  }

  Color _statusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'assigned':
        return Colors.blue;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Deliveries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchOrders,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _fetchOrders,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _orders.isEmpty
                  ? const Center(child: Text('No deliveries assigned'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _orders.length,
                      itemBuilder: (context, index) {
                        final order = _orders[index];
                        final status = order['status']?.toString() ?? 'pending';
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      order['member_name']?.toString() ??
                                          order['memberName']?.toString() ??
                                          'Unknown Member',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _statusColor(status),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        status.toUpperCase(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on,
                                        size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        order['delivery_address']?.toString() ??
                                            order['deliveryAddress']
                                                ?.toString() ??
                                            'No address',
                                        style: const TextStyle(
                                            color: Colors.grey, fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.currency_rupee,
                                        size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(
                                      order['total_amount']?.toString() ??
                                          order['totalAmount']?.toString() ??
                                          '0',
                                      style: const TextStyle(
                                          color: Colors.grey, fontSize: 13),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              ConfirmDeliveryScreen(order: order),
                                        ),
                                      ).then((_) => _fetchOrders());
                                    },
                                    child: const Text('Confirm Delivery'),
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

class ConfirmDeliveryScreen extends StatefulWidget {
  final Map<String, dynamic> order;

  const ConfirmDeliveryScreen({super.key, required this.order});

  @override
  State<ConfirmDeliveryScreen> createState() => _ConfirmDeliveryScreenState();
}

class _ConfirmDeliveryScreenState extends State<ConfirmDeliveryScreen> {
  final _otpController = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;

  Future<void> _confirmDelivery() async {
    final otp = _otpController.text.trim();
    if (otp.isEmpty) {
      setState(() => _error = 'Please enter OTP.');
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
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Order Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _detailRow(Icons.person, 'Member', memberName),
                    const SizedBox(height: 8),
                    _detailRow(Icons.location_on, 'Address', address),
                    const SizedBox(height: 8),
                    _detailRow(Icons.currency_rupee, 'Amount', amount),
                    const SizedBox(height: 8),
                    _detailRow(Icons.info_outline, 'Status', status.toUpperCase()),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Photo',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Camera not implemented yet')),
                );
              },
              child: Container(
                width: double.infinity,
                height: 160,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt, size: 48, color: Colors.grey),
                    SizedBox(height: 8),
                    Text('Take Photo',
                        style: TextStyle(color: Colors.grey, fontSize: 14)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Delivery OTP',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Enter OTP from member',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            if (_success != null)
              Text(_success!, style: const TextStyle(color: Colors.green)),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _confirmDelivery,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Confirm'),
              ),
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
        Icon(icon, size: 18, color: Colors.grey),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w600)),
        Expanded(child: Text(value)),
      ],
    );
  }
}
