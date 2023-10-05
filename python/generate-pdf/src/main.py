def main():
    fake_order = generate_fake_order()
    print(f"Generated fake order: {fake_order}")

    pdf_buffer = create_pdf(fake_order)
    print("PDF created.")
    
    # If you want to write the PDF to a file:
    # with open("output.pdf", "wb") as f:
    #     f.write(pdf_buffer)
    
    return pdf_buffer
