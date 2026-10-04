import uvicorn

if __name__ == "__main__":
    print("==================================================================")
    print("  AI-Enabled Labour Market Intelligence & Forecasting Engine")
    print("  Ministry of Skill Development and Entrepreneurship (MSDE)")
    print("  SIH Problem Statement ID: 26246")
    print("  Interactive API Documentation: http://127.0.0.1:8000/docs")
    print("==================================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
