import React from 'react';

// Định nghĩa kiểu dữ liệu cho các sự kiện form
declare global {
  namespace React {
    interface ChangeEvent<T> {
      currentTarget: EventTarget & T;
    }
  }
}

// Các kiểu dữ liệu khác có thể được thêm vào đây 