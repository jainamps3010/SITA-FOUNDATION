import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';

import '../../app/routes/app_routes.dart';
import '../../core/services/api_service.dart';

// ── Category model ────────────────────────────────────────────────────────────
class BusinessCategory {
  final String value;
  final String label;
  final Color color;
  const BusinessCategory(this.value, this.label, this.color);
}

const kCategories = [
  BusinessCategory('hotels_restaurants', 'Hotels & Restaurants',     Color(0xFF1565C0)),
  BusinessCategory('caterers',           'Caterers',                  Color(0xFF2E7D32)),
  BusinessCategory('religious_annkshetra','Religious Ann-Kshetra',    Color(0xFF6A1B9A)),
  BusinessCategory('bhojan_shala',       'Bhojan Shala',              Color(0xFFE65100)),
  BusinessCategory('tea_post_cafe',      'Tea Post / Small Cafes',    Color(0xFF00695C)),
  BusinessCategory('ngo_charitable',     'NGOs / Charitable Institutions', Color(0xFF37474F)),
];

class RegisterController extends GetxController {
  // ── Text controllers ────────────────────────────────────────────────────────
  final nameCtrl     = TextEditingController();
  final phoneCtrl    = TextEditingController();
  final emailCtrl    = TextEditingController();
  final businessCtrl = TextEditingController();
  final gstCtrl      = TextEditingController();
  final addressCtrl  = TextEditingController();
  final cityCtrl     = TextEditingController();
  final stateCtrl    = TextEditingController();
  final pincodeCtrl  = TextEditingController();
  final districtCtrl = TextEditingController();

  // ── Category ────────────────────────────────────────────────────────────────
  final selectedCategory = Rx<BusinessCategory?>(null);

  // ── Photo files ─────────────────────────────────────────────────────────────
  final businessRegCert = Rx<XFile?>(null);
  final fssaiLicense    = Rx<XFile?>(null);
  final frontPhoto      = Rx<XFile?>(null);
  final billingPhoto    = Rx<XFile?>(null);
  final kitchenPhoto    = Rx<XFile?>(null);
  final menuCardPhoto   = Rx<XFile?>(null);

  // ── GPS ─────────────────────────────────────────────────────────────────────
  final latitude       = Rx<double?>(null);
  final longitude      = Rx<double?>(null);
  final locationStatus  = ''.obs;
  final locationAddress = ''.obs;
  final isLocating     = false.obs;

  // ── State ───────────────────────────────────────────────────────────────────
  final isLoading = false.obs;

  final _picker = ImagePicker();

  // ── Pick image from gallery (JPG / PNG — any image, no format restriction) ──
  Future<void> pickImage(Rx<XFile?> target) async {
    try {
      final file = await _picker.pickImage(source: ImageSource.gallery);
      if (file != null) target.value = file;
    } catch (e) {
      Get.snackbar('Error', 'Could not pick image. Try again.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    }
  }

  // ── Pick document from storage (JPG, JPEG, PNG or PDF) ─────────────────────
  // withData: false + path-based reading is required on Android — many file
  // providers (Downloads, Google Drive, content URIs) return null bytes when
  // withData: true is used, which is the source of "Could not read file" errors.
  Future<void> pickDocument(Rx<XFile?> target) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
        withData: false,
      );
      if (result == null || result.files.isEmpty) return;
      final pf = result.files.first;

      Uint8List bytes;
      if (pf.path != null) {
        // Native path available (Android / iOS) — read directly from disk.
        bytes = await File(pf.path!).readAsBytes();
      } else if (pf.bytes != null) {
        // Web fallback — bytes already in memory.
        bytes = pf.bytes!;
      } else {
        Get.snackbar('Error', 'Could not read the selected file. Try again.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.red.shade50,
            colorText: Colors.red.shade800);
        return;
      }

      target.value = XFile.fromData(
        bytes,
        name: pf.name,
        mimeType: _mimeFromExt(pf.extension),
      );
    } catch (e) {
      Get.snackbar('Error', 'Could not open file picker. Try again.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    }
  }

  String? _mimeFromExt(String? ext) {
    switch (ext?.toLowerCase()) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png':  return 'image/png';
      case 'pdf':  return 'application/pdf';
      default:     return null;
    }
  }

  // ── Detect GPS location ─────────────────────────────────────────────────────
  Future<void> detectLocation() async {
    isLocating.value = true;
    locationAddress.value = '';
    locationStatus.value = 'Checking permissions…';
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        locationStatus.value = 'Location services are disabled. Enable GPS.';
        return;
      }

      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.deniedForever) {
        locationStatus.value = 'Location permission permanently denied.';
        return;
      }

      locationStatus.value = 'Getting location…';
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      latitude.value  = pos.latitude;
      longitude.value = pos.longitude;

      locationStatus.value = 'Fetching district…';
      await _reverseGeocode(pos.latitude, pos.longitude);
      locationStatus.value = 'Location captured ✓';
    } catch (e) {
      locationStatus.value = 'Could not get location. Enter district manually.';
    } finally {
      isLocating.value = false;
    }
  }

  Future<void> _reverseGeocode(double lat, double lng) async {
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=json',
      );
      final resp = await http.get(uri, headers: {
        'User-Agent': 'SITAFoundationApp/1.0 (contact@sitafoundation.org)',
      }).timeout(const Duration(seconds: 8));

      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final addr = data['address'] as Map<String, dynamic>? ?? {};

        final district = (addr['district'] ?? addr['county'] ??
            addr['state_district'] ?? '').toString();
        final city  = (addr['city'] ?? addr['town'] ?? addr['village'] ?? '').toString();
        final state = (addr['state'] ?? '').toString();

        if (districtCtrl.text.isEmpty && district.isNotEmpty) districtCtrl.text = district;
        if (cityCtrl.text.isEmpty && city.isNotEmpty)         cityCtrl.text = city;
        if (stateCtrl.text.isEmpty && state.isNotEmpty)        stateCtrl.text = state;

        final parts = [city, district, state].where((s) => s.isNotEmpty).toList();
        if (parts.isNotEmpty) locationAddress.value = parts.join(', ');
      }
    } catch (_) {}
  }

  // ── Pincode → city / state / district auto-fill ────────────────────────────
  Future<void> lookupPincode(String value) async {
    if (value.length != 6) return;
    try {
      final resp = await http
          .get(Uri.parse('https://api.postalpincode.in/pincode/$value'))
          .timeout(const Duration(seconds: 6));
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as List<dynamic>;
        if (data[0]['Status'] == 'Success') {
          final po = data[0]['PostOffice'][0] as Map<String, dynamic>;
          final district = po['District']?.toString() ?? '';
          final state    = po['State']?.toString()    ?? '';
          final city     = po['Block']?.toString()    ?? '';
          if (district.isNotEmpty) districtCtrl.text = district;
          if (state.isNotEmpty)    stateCtrl.text    = state;
          if (city.isNotEmpty)     cityCtrl.text     = city;
        }
      }
    } catch (_) {}
  }

  // ── Validate and submit ─────────────────────────────────────────────────────
  Future<void> register() async {
    final name    = nameCtrl.text.trim();
    final phone   = phoneCtrl.text.trim();
    final biz     = businessCtrl.text.trim();
    final gst     = gstCtrl.text.trim();
    final address = addressCtrl.text.trim();
    final city    = cityCtrl.text.trim();
    final state   = stateCtrl.text.trim();

    if (name.isEmpty) { _err('Please enter your full name'); return; }
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
      _err('Enter a valid 10-digit Indian mobile number'); return;
    }
    if (biz.isEmpty)  { _err('Please enter your business name'); return; }
    if (selectedCategory.value == null) {
      _err('Please select a business category'); return;
    }
    if (gst.isEmpty)  { _err('GST Number is required'); return; }
    if (address.isEmpty || city.isEmpty || state.isEmpty) {
      _err('Please complete the address fields'); return;
    }
    if (businessRegCert.value == null) {
      _err('Upload Business Registration Certificate'); return;
    }
    if (fssaiLicense.value == null) {
      _err('Upload FSSAI License'); return;
    }
    if (frontPhoto.value == null || billingPhoto.value == null ||
        kitchenPhoto.value == null || menuCardPhoto.value == null) {
      _err('Upload all 4 establishment photos'); return;
    }

    // Auto-capture GPS if not done yet
    if (latitude.value == null) {
      await detectLocation();
      // GPS failure is non-blocking — user must manually enter district
      if (latitude.value == null && districtCtrl.text.trim().isEmpty) {
        _err('Could not detect location. Please enter your district.'); return;
      }
    }

    isLoading.value = true;
    try {
      final fields = <String, String>{
        'name':          name,
        'mobile':        phone,
        'business_name': biz,
        'category':      selectedCategory.value!.value,
        'gst_number':    gst,
        'address':       address,
        'city':          city,
        'state':         state,
        'pincode':       pincodeCtrl.text.trim(),
        'district':      districtCtrl.text.trim(),
        if (emailCtrl.text.trim().isNotEmpty) 'email': emailCtrl.text.trim(),
        if (latitude.value != null)  'latitude':  latitude.value!.toStringAsFixed(7),
        if (longitude.value != null) 'longitude': longitude.value!.toStringAsFixed(7),
      };

      Future<MapEntry<String, ({Uint8List bytes, String filename})>> toEntry(
        String field, XFile file) async {
        final bytes = await file.readAsBytes();
        final ext = file.name.contains('.') ? '.${file.name.split('.').last}' : '.jpg';
        return MapEntry(field, (bytes: bytes, filename: '$field$ext'));
      }

      final files = <MapEntry<String, ({Uint8List bytes, String filename})>>[
        await toEntry('business_reg_certificate', businessRegCert.value!),
        await toEntry('fssai_license',            fssaiLicense.value!),
        await toEntry('establishment_front_photo', frontPhoto.value!),
        await toEntry('billing_counter_photo',    billingPhoto.value!),
        await toEntry('kitchen_photo',            kitchenPhoto.value!),
        await toEntry('menu_card_photo',          menuCardPhoto.value!),
      ];

      await Get.find<ApiService>().multipartBytes('/auth/register', fields, files);

      Get.offAllNamed(Routes.login);
      await Future.delayed(const Duration(milliseconds: 300));
      Get.snackbar(
        'Application Submitted! 🎉',
        'Your registration is under review. We will notify you once approved.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2E7D32),
        colorText: Colors.white,
        duration: const Duration(seconds: 6),
        margin: const EdgeInsets.all(12),
        borderRadius: 12,
      );
    } on ApiException catch (e) {
      final msg = e.statusCode == 409
          ? 'This mobile number is already registered. Please login instead.'
          : e.message;
      _err(msg);
    } catch (_) {
      _err('Could not submit registration. Check your connection and try again.');
    } finally {
      isLoading.value = false;
    }
  }

  void _err(String msg) => Get.snackbar(
        'Required',
        msg,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade50,
        colorText: Colors.red.shade800,
        duration: const Duration(seconds: 4),
        margin: const EdgeInsets.all(12),
      );

  @override
  void onClose() {
    nameCtrl.dispose();     phoneCtrl.dispose();    emailCtrl.dispose();
    businessCtrl.dispose(); gstCtrl.dispose();      addressCtrl.dispose();
    cityCtrl.dispose();     stateCtrl.dispose();    pincodeCtrl.dispose();
    districtCtrl.dispose();
    super.onClose();
  }
}
