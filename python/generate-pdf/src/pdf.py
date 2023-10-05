import pdfkit

def create_pdf(order):
    content = """
    <h2>Sample Invoice</h2>
    <p>Date: {}</p>
    <h3>Hello, {}!</h3>
    <p>Order ID: {}</p>
    <p>Total: ${:.2f}</p>
    <ul>
    """.format(order["date"], order["name"], order["id"], order["total"])

    for item in order["items"]:
        content += "<li>{} x {} = ${:.2f}</li>".format(item["description"], item["quantity"], item["cost"])

    content += "</ul>"

    pdf_bytes = pdfkit.from_string(content, False)
    return pdf_bytes
