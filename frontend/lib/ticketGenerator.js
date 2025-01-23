import { jsPDF } from 'jspdf';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateEventTicket = (event) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 148.5] // A5 size
  });

  // Add background gradient
  doc.setFillColor(246, 64, 95); // Primary color
  doc.rect(0, 0, 210, 148.5, 'F');
  doc.setFillColor(156, 39, 176); // Secondary color
  doc.rect(105, 0, 105, 148.5, 'F');

  // Add decorative elements
  doc.setFillColor(255, 255, 255, 0.1);
  doc.circle(180, 20, 30, 'F');
  doc.circle(30, 130, 40, 'F');

  // Add white container for content
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 15, 180, 118.5, 5, 5, 'F');

  // Add event title
  doc.setTextColor(33, 33, 33);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(event.event.title, 25, 35, {
    maxWidth: 120 // Reduced width to make space for QR
  });

  // Add Univent logo/text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text('UNIVENT', 25, 45);

  // Add divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(25, 50, 125, 50); // Shortened line

  // Left side content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);

  // Event details in left column
  doc.text('DATE & TIME', 25, 65);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(event.event.event_date), 25, 72);
  doc.text(formatTime(event.event.event_time), 25, 79);

  doc.setFont('helvetica', 'normal');
  doc.text('VENUE', 25, 90);
  doc.setFont('helvetica', 'bold');
  doc.text(event.event.venue, 25, 97, {
    maxWidth: 80
  });

  doc.setFont('helvetica', 'normal');
  doc.text('SEATS', 25, 108);
  doc.setFont('helvetica', 'bold');
  doc.text(event.number_of_seats.toString(), 25, 115);

  doc.setFont('helvetica', 'normal');
  doc.text('AMOUNT PAID', 25, 126);
  doc.setFont('helvetica', 'bold');
  const formattedAmount = event.total_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  doc.text(`Tk ${formattedAmount}`, 25, 133);

  // Right side - QR Code section
  if (event.qr_code) {
    // White background for QR
    doc.setFillColor(255, 255, 255);
    doc.rect(135, 35, 50, 50, 'F');
    
    // Add QR code
    doc.addImage(event.qr_code, 'PNG', 135, 35, 50, 50);
    
    // Add "SCAN TO VERIFY" text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('SCAN TO VERIFY', 135, 95);
    
    // Add ticket ID
    doc.text(`TICKET ID: ${event.id.slice(0, 8).toUpperCase()}`, 135, 105);
  }

  // Save the PDF
  doc.save(`${event.event.title}-ticket.pdf`);
};
