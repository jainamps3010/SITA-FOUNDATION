import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/order_model.dart';

class DeliveriesController extends GetxController {
  static const _baseUrl = 'http://192.168.0.102:3000/api/v1';

  final orders = <Order>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadOrders();
  }

  Future<void> loadOrders() async {
    isLoading.value = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('driver_auth_token');
      final res = await http.get(
        Uri.parse('$_baseUrl/delivery/my-orders'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      if (res.statusCode == 401) {
        Get.offAllNamed('/login');
        return;
      }
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final list =
          (data['orders'] as List? ?? data['data'] as List? ?? []);
      orders.value =
          list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      Get.snackbar('Error', 'Could not load deliveries',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white);
    } finally {
      isLoading.value = false;
    }
  }
}
