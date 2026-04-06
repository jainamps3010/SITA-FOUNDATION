import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService extends GetxService {
  static StorageService get to => Get.find();

  SharedPreferences? _prefs;

  static const _keyToken = 'auth_token';
  static const _keyMember = 'member_data';

  /// Called lazily — never blocks app startup.
  Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  /// Synchronous read — returns null if prefs not loaded yet.
  /// Safe to call from splash without awaiting.
  bool get isLoggedIn {
    try {
      return _prefs?.getString(_keyToken) != null;
    } catch (_) {
      return false;
    }
  }

  String? get token {
    try {
      return _prefs?.getString(_keyToken);
    } catch (_) {
      return null;
    }
  }

  Map<String, dynamic>? get member {
    try {
      final raw = _prefs?.getString(_keyMember);
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

  Future<void> saveMember(Map<String, dynamic> data) async {
    final p = await _getPrefs();
    await p.setString(_keyMember, jsonEncode(data));
  }

  Future<void> clearAll() async {
    final p = await _getPrefs();
    await p.remove(_keyToken);
    await p.remove(_keyMember);
  }

  /// Call this early in background to warm up the prefs cache.
  Future<void> warmUp() async {
    try {
      await _getPrefs();
    } catch (_) {}
  }
}
