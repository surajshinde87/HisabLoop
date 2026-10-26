package com.hisabloop.integration;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.company.Membership;
import com.hisabloop.notification.NotificationService;
import com.hisabloop.user.User;

/** Sends WhatsApp-style status messages about claims through the configured gateway. */
@Service
public class ClaimMessenger {

    private final MessagingGateway gateway;
    private final NotificationService notifications;

    public ClaimMessenger(MessagingGateway gateway, NotificationService notifications) {
        this.gateway = gateway;
        this.notifications = notifications;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void submitted(ExpenseClaim c, String approverName, Membership approver) {
        toEmployee(c, "CLAIM_SUBMITTED", "Done! " + c.getReference() + " (" + rupees(c.getTotalAmount())
                + ") sent to " + approverName + " for approval.");
        if (approver != null) {
            send(c.getCompanyId(), approver.getUser(), "APPROVAL_REQUESTED",
                    "New claim " + c.getReference() + " from " + c.getEmployee().getUser().getFullName() + ": "
                            + rupees(c.getTotalAmount()) + " · " + vendor(c) + ". Reply in HisabLoop to approve.");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void approved(ExpenseClaim c, boolean finalApproval, String approverName) {
        if (finalApproval) {
            toEmployee(c, "CLAIM_APPROVED", "Approved! " + c.getReference() + " (" + rupees(c.getTotalAmount())
                    + ") will be paid in the next reimbursement batch.");
        } else {
            toEmployee(c, "CLAIM_LEVEL_APPROVED", approverName + " approved " + c.getReference()
                    + ". It now needs a second approval from a company admin.");
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void rejected(ExpenseClaim c, String approverName, String reason) {
        toEmployee(c, "CLAIM_REJECTED", approverName + " rejected " + c.getReference() + ": " + reason);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void changesRequested(ExpenseClaim c, String approverName, String reason) {
        toEmployee(c, "CHANGES_REQUESTED", approverName + " has a question about " + c.getReference() + ": " + reason
                + " Please update the claim and confirm again.");
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void paid(ExpenseClaim c, String method, String reference) {
        toEmployee(c, "CLAIM_PAID", "Paid! " + c.getReference() + " (" + rupees(c.getTotalAmount()) + ") via "
                + method + ", ref " + reference + ".");
    }

    public String mode() {
        return gateway.mode();
    }

    private void toEmployee(ExpenseClaim c, String template, String text) {
        send(c.getCompanyId(), c.getEmployee().getUser(), template, text);
    }

    private void send(String companyId, User user, String template, String text) {
        String to = user.getPhone() != null ? user.getPhone() : user.getEmail();
        boolean delivered;
        try {
            delivered = gateway.send(to, text);
        } catch (RuntimeException e) {
            notifications.save(companyId, user.getId(), "WHATSAPP", to, template, null, text, "FAILED");
            return;
        }
        notifications.save(companyId, user.getId(), "WHATSAPP", to, template, null, text,
                delivered ? "SENT" : "LOGGED");
    }

    private static String vendor(ExpenseClaim c) {
        return c.getVendorName() != null ? c.getVendorName() : c.getDescription() == null ? "" : c.getDescription();
    }

    static String rupees(BigDecimal amount) {
        NumberFormat f = NumberFormat.getCurrencyInstance(Locale.of("en", "IN"));
        return f.format(amount == null ? BigDecimal.ZERO : amount).replace("Rs.", "₹").replace("Rs", "₹");
    }
}
