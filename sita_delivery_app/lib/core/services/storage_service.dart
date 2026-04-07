import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService extends GetxService {
  static StorageService get to => Get.find();

  SharedPreferences? _prefs;

  static const _keyToken = 'driver_auth_token';
  static const _keyDriver = 'driver_data';

  // Lazily initializes prefs — safe to call from async context.
  Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  bool get isLoggedIn {
    return _prefs?.getString(_keyToken) != null;
  }

  String? get token {
    return _prefs?.getString(_keyToken);
  }

  Map<String, dynamic>? get driver {
    try {
      final raw = _prefs?.getString(_keyDriver);
      if (raw == null) return null;
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> saveToken(String token) async {
    final p = await _getPrefs();
    await p.setString(_keyToken, token);
  }

  Future<void> saveDriver(Map<String, dynamic> data) async {
    final p = await _getPrefs();
    await p.setString(_keyDriver, jsonEncode(data));
  }

  Future<void> clearAll() async {
    final p = await _getPrefs();
    await p.remove(_keyToken);
    await p.remove(_keyDriver);
  }

  /// Call this before checking isLoggedIn / token.
  Future<void> warmUp() async {
    await _getPrefs();
  }
}
