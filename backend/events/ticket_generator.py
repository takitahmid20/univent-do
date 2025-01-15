from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import io
import qrcode
import os
from PIL import Image as PILImage
import base64

def format_date(date_str):
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%B %d, %Y')
    except:
        return date_str

def format_time(time_str):
    try:
        time_obj = datetime.strptime(time_str, '%H:%M:%S')
        return time_obj.strftime('%I:%M %p')
    except:
        return time_str

def generate_ticket_pdf(registration_data):
    try:
        # Create a buffer for the PDF
        buffer = io.BytesIO()
        
        # Create custom page size for ticket (5.5 x 2 inches)
        pagesize = (396, 144)  # 5.5 x 2 inches in points (72 points per inch)
        
        # Create the PDF object using reportlab
        p = canvas.Canvas(buffer, pagesize=pagesize)
        width, height = pagesize
        
        # Draw background color
        p.setFillColorRGB(0.95, 0.95, 0.95)  # Light gray
        p.rect(0, 0, width, height, fill=True)
        
        # Draw white background for ticket content
        p.setFillColorRGB(1, 1, 1)  # White
        p.roundRect(10, 10, width - 20, height - 20, 10, fill=True)
        
        # Reset text color to black
        p.setFillColorRGB(0, 0, 0)
        
        # Add event title
        p.setFont("Helvetica-Bold", 12)
        title = registration_data.get('title', 'Event Title Not Available')
        p.drawString(20, height - 40, title)
        
        # Add ticket ID
        p.setFont("Helvetica", 8)
        p.drawString(20, height - 55, f"Ticket ID: {registration_data['id']}")
        
        # Add event details
        p.setFont("Helvetica", 8)
        y = height - 75
        
        details = [
            f"Date: {format_date(registration_data.get('event_date', ''))}",
            f"Time: {format_time(registration_data.get('event_time', ''))}",
            f"Venue: {registration_data.get('venue', '')}",
            f"Attendee: {registration_data.get('attendee_name', '')}",
            f"Email: {registration_data.get('attendee_email', '')}",
            f"Seats: {registration_data.get('number_of_seats', 0)}",
        ]
        
        # Add dietary requirements and t-shirt size if provided
        if registration_data.get('dietary_requirements'):
            details.append(f"Dietary: {registration_data['dietary_requirements']}")
        if registration_data.get('t_shirt_size'):
            details.append(f"T-Shirt: {registration_data['t_shirt_size']}")
        
        for detail in details:
            p.drawString(20, y, detail)
            y -= 12
        
        # Add QR code
        try:
            qr_data_uri = registration_data.get('qr_code')
            if qr_data_uri and qr_data_uri.startswith('data:image/png;base64,'):
                qr_base64 = qr_data_uri.split(',')[1]
                qr_bytes = base64.b64decode(qr_base64)
                qr_buffer = io.BytesIO(qr_bytes)
                qr_pil = PILImage.open(qr_buffer)
                
                # Draw QR code (smaller size for ticket)
                p.drawInlineImage(qr_pil, width - 90, height - 120, width=70, height=70)
        except Exception as e:
            print(f"Error adding QR code: {str(e)}")
        
        # Add footer
        p.setFont("Helvetica", 6)
        p.drawString(20, 20, "Valid for one-time entry only")
        reg_date = registration_data.get('registration_date', datetime.now().strftime('%Y-%m-%d'))
        p.drawString(width - 120, 20, f"Generated: {format_date(reg_date)}")
        
        # Save the PDF
        p.showPage()
        p.save()
        
        # Get the value of the buffer
        pdf_value = buffer.getvalue()
        buffer.close()
        
        return pdf_value
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        # Create a simple error PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=(396, 144))
        p.setFont("Helvetica", 10)
        p.drawString(20, 72, "Error generating ticket. Please contact support.")
        p.showPage()
        p.save()
        return buffer.getvalue()
