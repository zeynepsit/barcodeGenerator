package com.example.demo.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.oned.EAN13Writer;
import com.google.zxing.oned.Code128Writer;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class BarcodeService {
    

    

    public byte[] generateCode128Barcode(String barcodeText, int width, int height) throws WriterException, IOException {
        Code128Writer code128Writer = new Code128Writer();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);
        
        BitMatrix bitMatrix = code128Writer.encode(barcodeText, BarcodeFormat.CODE_128, width, height, hints);
        
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    
    private String calculateEAN13Checksum(String baseNumber) {
        int sum = 0;
        for (int i = 0; i < baseNumber.length(); i++) {
            int digit = Character.getNumericValue(baseNumber.charAt(i));
            if (i % 2 == 0) {
                sum += digit;
            } else {
                sum += digit * 3;
            }
        }
        int checksum = (10 - (sum % 10)) % 10;
        return String.valueOf(checksum);
    }
}
