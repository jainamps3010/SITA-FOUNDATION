import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:get/get.dart' hide Response;
import 'storage_service.dart';

class ApiService extends GetxService {
  static const String baseUrl = 'http://10.0.2.2:3000/api/v1';

  Map<String, String> get _headers {
    final token = StorageService.to.token;
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> get(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
    );
    return _handle(response);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handle(response);
  }

  Future<Map<String, dynamic>> put(String path, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handle(response);
  }

  /// Upload files as bytes — works on both web and native.
  /// [files] entries: key = form field name, value = (bytes, filename).
  Future<Map<String, dynamic>> multipartBytes(
    String path,
    Map<String, String> fields,
    List<MapEntry<String, ({Uint8List bytes, String filename})>> files,
  ) async {
    final token = StorageService.to.token;
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$path'));
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    request.fields.addAll(fields);
    for (final entry in files) {
      request.files.add(http.MultipartFile.fromBytes(
        entry.key,
        entry.value.bytes,
        filename: entry.value.filename,
      ));
    }
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _handle(response);
  }

  Map<String, dynamic> _handle(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    if (response.statusCode == 401) {
      StorageService.to.clearAll();
      Get.offAllNamed('/login');
    }
    throw ApiException(
      message: data['message'] ?? 'Something went wrong',
      statusCode: response.statusCode,
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => message;
}
