"""
Simple PDF Report Generator using ReportLab
Creates basic Ayurvedic assessment reports
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from datetime import datetime
import os

def generate_pdf_report(user_data, dosha_results, panchakarma_recs):
    """
    Generate a simple PDF report with assessment results

    Args:
        user_data: User information and assessment responses
        dosha_results: Dosha scores and percentages
        panchakarma_recs: Panchakarma therapy recommendations

    Returns:
        PDF file path
    """

    # Create reports directory
    reports_dir = os.path.join(os.path.dirname(__file__), '..', 'reports')
    os.makedirs(reports_dir, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    pdf_path = os.path.join(reports_dir, f'assessment_report_{timestamp}.pdf')

    # Create PDF document
    doc = SimpleDocTemplate(pdf_path, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=20,
        alignment=1,
        textColor=colors.darkgreen
    )

    story.append(Paragraph("AyurSutra Assessment Report", title_style))
    story.append(Paragraph("Ayurvedic Wellness Analysis", styles['Heading2']))
    story.append(Spacer(1, 20))

    # Dosha Results
    story.append(Paragraph("Your Dosha Results", styles['Heading2']))

    dosha_data = [
        ['Dosha', 'Percentage'],
        ['Vata', f"{dosha_results['percentages']['vata']}%"],
        ['Pitta', f"{dosha_results['percentages']['pitta']}%"],
        ['Kapha', f"{dosha_results['percentages']['kapha']}%"]
    ]

    dosha_table = Table(dosha_data, colWidths=[2*inch, 2*inch])
    dosha_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.green),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(dosha_table)
    story.append(Spacer(1, 20))

    # Therapies
    if panchakarma_recs and 'therapy_details' in panchakarma_recs:
        story.append(Paragraph("Recommended Therapies", styles['Heading2']))
        for therapy in panchakarma_recs['therapy_details']:
            story.append(Paragraph(f"• {therapy['name']}: {therapy['description']}", styles['Normal']))
            story.append(Spacer(1, 10))

    # Footer
    story.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.gray,
        alignment=1
    )
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d')}", footer_style))

    # Build PDF
    doc.build(story)
    print(f"Simple PDF generated at: {pdf_path}")
    return pdf_path