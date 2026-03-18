package org.hartford.miniproject.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.hartford.miniproject.entity.Payment;
import org.hartford.miniproject.entity.PolicyOrder;
import org.hartford.miniproject.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfInvoiceService {

    @Value("${payment.invoice.dir:./data/invoices}")
    private String invoiceDir;

    public File generateInvoice(Payment payment, PolicyOrder order, User user) {
        log.info("Generating invoice for payment ID: {}", payment.getId());
        Document document = new Document();
        try {
            Path dirPath = Paths.get(invoiceDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            String fileName = "Invoice_" + payment.getTransactionId() + ".pdf";
            File file = new File(dirPath.toFile(), fileName);

            PdfWriter.getInstance(document, new FileOutputStream(file));
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
            Font boldFont = new Font(Font.HELVETICA, 12, Font.BOLD);

            Paragraph title = new Paragraph("DriveIQ Insurance - Payment Receipt\n\n", titleFont);
            title.setAlignment(1); // Center
            document.add(title);

            document.add(new Paragraph("Transaction Details", boldFont));
            document.add(new Paragraph("Transaction ID: " + payment.getTransactionId(), normalFont));
            document.add(new Paragraph("Date: " + payment.getPaymentDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), normalFont));
            document.add(new Paragraph("Status: " + payment.getPaymentStatus(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Customer Information", boldFont));
            document.add(new Paragraph("Name: " + user.getFullName(), normalFont));
            document.add(new Paragraph("Email: " + user.getEmail(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Policy Details", boldFont));
            document.add(new Paragraph("Policy Name: " + order.getPolicy().getPolicyName(), normalFont));
            document.add(new Paragraph("Application ID: " + order.getOrderId(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Amount Paid: $" + payment.getAmount(), new Font(Font.HELVETICA, 14, Font.BOLD)));

            log.info("Invoice generated successfully at {}", file.getAbsolutePath());
            return file;

        } catch (DocumentException | IOException e) {
            log.error("Error generating invoice for payment ID: {}", payment.getId(), e);
            throw new RuntimeException("Could not generate invoice", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
    }
}
