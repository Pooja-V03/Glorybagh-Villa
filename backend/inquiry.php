<?php
/**
 * GloryBagh Villa — Inquiry Form Handler
 * backend/inquiry.php
 *
 * SETUP:
 * 1. Replace $to_email with the actual villa email address.
 * 2. Ensure your hosting has PHP mail() or configure SMTP below.
 * 3. For Google Sites (static), use FormSpree or EmailJS instead —
 *    see README.md for instructions.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Sanitise inputs ────────────────────────────────────
function sanitize($val) {
    return htmlspecialchars(strip_tags(trim($val ?? '')), ENT_QUOTES, 'UTF-8');
}

$firstName = sanitize($_POST['firstName'] ?? '');
$lastName  = sanitize($_POST['lastName']  ?? '');
$email     = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$phone     = sanitize($_POST['phone']    ?? '');
$checkin   = sanitize($_POST['checkin']  ?? '');
$checkout  = sanitize($_POST['checkout'] ?? '');
$guests    = sanitize($_POST['guests']   ?? '');
$occasion  = sanitize($_POST['occasion'] ?? '');
$message   = sanitize($_POST['message']  ?? '');

// ── Validation ─────────────────────────────────────────
if (empty($firstName) || empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name and email are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// ── Compose email ──────────────────────────────────────
$to_email    = 'glorybaghvilla@gmail.com';   // ← REPLACE with actual email
$from_name   = 'GloryBagh Villa Website';
$subject     = "New Inquiry — {$firstName} {$lastName}";

$body = "
New Booking Inquiry — GloryBagh Villa
======================================

Name      : {$firstName} {$lastName}
Email     : {$email}
Phone     : {$phone}

Check-in  : {$checkin}
Check-out : {$checkout}
Guests    : {$guests}
Occasion  : {$occasion}

Message:
{$message}

--------------------------------------
Received via GloryBagh Villa website
";

$headers  = "From: {$from_name} <no-reply@glorybagh.com>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// ── Also send confirmation to guest ───────────────────
$guest_subject = "Your Inquiry — GloryBagh Villa, Udaipur";
$guest_body = "
Dear {$firstName},

Thank you for reaching out to GloryBagh Villa.

We have received your inquiry and our hospitality team will contact you
within a few hours to discuss availability and your requirements.

Your Details:
  Check-in  : {$checkin}
  Check-out : {$checkout}
  Guests    : {$guests}
  Occasion  : {$occasion}

For urgent queries, please WhatsApp us at: +91 XXXXX XXXXX

Warm regards,
GloryBagh Villa Team
Udaipur, Rajasthan
";

$guest_headers  = "From: GloryBagh Villa <glorybaghvilla@gmail.com>\r\n";
$guest_headers .= "X-Mailer: PHP/" . phpversion();

// ── Send ───────────────────────────────────────────────
$sent_to_villa = mail($to_email, $subject, $body, $headers);
mail($email, $guest_subject, $guest_body, $guest_headers); // confirmation to guest

if ($sent_to_villa) {
    echo json_encode(['success' => true, 'message' => 'Inquiry sent successfully.']);
} else {
    // mail() failed — log and respond
    error_log("GloryBagh inquiry mail failed for: {$email}");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email delivery failed. Please try again.']);
}
?>
