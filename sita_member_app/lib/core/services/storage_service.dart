import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService extends GetxService {
  static StorageService get to => Get.find();

  SharedPreferences? _prefs;

  static const _keyToken = 'auth_token';
  static const _keyMember = 'member_data';

  // Session-only storage (not persisted to SharedPreferences).
  // Used when user logs in with "Remember Me" off.
  String? _sessionToken;
  Map<String, dynamic>? _sessionMember;

  Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  bool get isLoggedIn {
    if (_sessionToken != null) return true;
    try {
      return _prefs?.getString(_keyToken) != null;
    } catch (_) {
      return false;
    }
  }

  String? get token {
    return _sessionToken ?? _prefs?.getString(_keyToken);
  }

  Map<String, dynamic>? get member {
    if (_sessionMember != null) return _sessionMember;
    try {
      final raw = _prefs?.getString(_keyMember);
      if (raw == null) return null;
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  /// [remember] = true persists to SharedPreferences (survives app restarts).
  /// [remember] = false stores in memory only (clears when app is killed).
  Future<void> saveToken(String token, {bool remember = true}) async {
    if (remember) {
      final p = await _getPrefs();
      await p.setString(_keyToken, token);
      _sessionToken = null;
    } else {
      _sessionToken = token;
      // Remove any previously persisted token so a fresh launch goes to login.
      final p = await _getPrefs();
      await p.remove(_keyToken);
    }
  }

  Future<void> saveMember(Map<String, dynamic> data, {bool remember = true}) async {
    if (remember) {
      final p = await _getPrefs();
      await p.setString(_keyMember, jsonEncode(data));
      _sessionMember = null;
    } else {
      _sessionMember = data;
      final p = await _getPrefs();
      await p.remove(_keyMember);
    }
  }

  Future<void> clearAll() async {
    _sessionToken = null;
    _sessionMember = null;
    final p = await _getPrefs();
    await p.remove(_keyToken);
    await p.remove(_keyMember);
  }

  Future<void> warmUp() async {
    try {
      await _getPrefs();
    } catch (_) {}
  }
}
