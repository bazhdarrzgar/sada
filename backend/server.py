from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models for all 7 modules

# 1. Calendar Management (بەڕێوەبردنی ساڵنامە)
class CalendarEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: str
    week1: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])
    week2: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])
    week3: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])
    week4: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])

# 2. Staff Records (تۆمارەکانی ستاف)
class StaffRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fullName: str
    mobile: str
    address: str
    gender: str
    dateOfBirth: str
    marriage: str = ""
    certificate: str
    age: int
    education: str
    attendance: str
    date: str
    department: str
    pass_: str = Field(alias="pass")
    contract: str

    class Config:
        populate_by_name = True

# 3. Payroll Management (لیستی بڕی موچە)
class PayrollRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employeeName: str
    salary: float
    absence: float = 0
    deduction: float = 0
    bonus: float = 0
    total: float = 0
    notes: str = ""

# 4. Supervision System (چاودێری)
class SupervisionRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    teacherName: str = ""
    subject: str = ""
    teacherDepartment: str = ""
    teacherGrade: str = ""
    teacherViolationType: str = ""
    teacherPunishmentType: str = ""
    studentName: str = ""
    studentDepartment: str = ""
    studentGrade: str = ""
    studentViolationType: str = ""
    studentPunishmentType: str = ""

# 5. Annual Installments (قیستی ساڵانه)
class InstallmentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fullName: str
    grade: str
    installmentType: str
    annualAmount: float
    firstInstallment: float = 0
    secondInstallment: float = 0
    thirdInstallment: float = 0
    fourthInstallment: float = 0
    fifthInstallment: float = 0
    sixthInstallment: float = 0
    totalReceived: float = 0
    remaining: float = 0

# 6. Monthly Expenses (خەرجی مانگانه)
class MonthlyExpenseRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: str
    month: str
    staffSalary: float = 0
    expenses: float = 0
    buildingRent: float = 0
    dramaFee: float = 0
    socialSupport: float = 0
    electricity: float = 0
    total: float = 0
    notes: str = ""

# 7. Daily Accounts (حساباتی رۆژانه)
class DailyAccountRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    week: str
    purpose: str
    checkNumber: str
    amount: float

# Legend for Calendar
class LegendEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    abbreviation: str
    full_description: str
    category: str = "General"
    usage_count: int = 0

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Berdoz Management System API"}

# Calendar Management APIs
@api_router.get("/calendar", response_model=List[CalendarEntry])
async def get_calendar_entries():
    entries = await db.calendar.find().to_list(1000)
    return [CalendarEntry(**{**entry, "_id": str(entry["_id"]) if "_id" in entry else entry.get("id", str(uuid.uuid4()))}) for entry in entries]

@api_router.post("/calendar", response_model=CalendarEntry)
async def create_calendar_entry(entry: CalendarEntry):
    entry_dict = entry.dict()
    result = await db.calendar.insert_one(entry_dict)
    return entry

@api_router.put("/calendar/{entry_id}", response_model=CalendarEntry)
async def update_calendar_entry(entry_id: str, entry: CalendarEntry):
    entry_dict = entry.dict()
    await db.calendar.update_one({"id": entry_id}, {"$set": entry_dict})
    return entry

@api_router.delete("/calendar/{entry_id}")
async def delete_calendar_entry(entry_id: str):
    await db.calendar.delete_one({"id": entry_id})
    return {"message": "Entry deleted"}

# Staff Records APIs
@api_router.get("/staff", response_model=List[StaffRecord])
async def get_staff_records():
    records = await db.staff.find().to_list(1000)
    return [StaffRecord(**{**record, "_id": str(record["_id"]) if "_id" in record else record.get("id", str(uuid.uuid4()))}) for record in records]

@api_router.post("/staff", response_model=StaffRecord)
async def create_staff_record(record: StaffRecord):
    record_dict = record.dict(by_alias=True)
    result = await db.staff.insert_one(record_dict)
    return record

@api_router.put("/staff/{record_id}", response_model=StaffRecord)
async def update_staff_record(record_id: str, record: StaffRecord):
    record_dict = record.dict(by_alias=True)
    await db.staff.update_one({"id": record_id}, {"$set": record_dict})
    return record

@api_router.delete("/staff/{record_id}")
async def delete_staff_record(record_id: str):
    await db.staff.delete_one({"id": record_id})
    return {"message": "Staff record deleted"}

# Payroll Management APIs
@api_router.get("/payroll", response_model=List[PayrollRecord])
async def get_payroll_records():
    records = await db.payroll.find().to_list(1000)
    return [PayrollRecord(**{**record, "_id": str(record["_id"]) if "_id" in record else record.get("id", str(uuid.uuid4()))}) for record in records]

@api_router.post("/payroll", response_model=PayrollRecord)
async def create_payroll_record(record: PayrollRecord):
    # Auto-calculate total
    record.total = record.salary - record.absence - record.deduction + record.bonus
    record_dict = record.dict()
    result = await db.payroll.insert_one(record_dict)
    return record

@api_router.put("/payroll/{record_id}", response_model=PayrollRecord)
async def update_payroll_record(record_id: str, record: PayrollRecord):
    # Auto-calculate total
    record.total = record.salary - record.absence - record.deduction + record.bonus
    record_dict = record.dict()
    await db.payroll.update_one({"id": record_id}, {"$set": record_dict})
    return record

# Supervision System APIs
@api_router.get("/supervision", response_model=List[SupervisionRecord])
async def get_supervision_records():
    records = await db.supervision.find().to_list(1000)
    return [SupervisionRecord(**{**record, "_id": str(record["_id"]) if "_id" in record else record.get("id", str(uuid.uuid4()))}) for record in records]

@api_router.post("/supervision", response_model=SupervisionRecord)
async def create_supervision_record(record: SupervisionRecord):
    record_dict = record.dict()
    result = await db.supervision.insert_one(record_dict)
    return record

@api_router.put("/supervision/{record_id}", response_model=SupervisionRecord)
async def update_supervision_record(record_id: str, record: SupervisionRecord):
    record_dict = record.dict()
    await db.supervision.update_one({"id": record_id}, {"$set": record_dict})
    return record

@api_router.delete("/supervision/{record_id}")
async def delete_supervision_record(record_id: str):
    await db.supervision.delete_one({"id": record_id})
    return {"message": "Supervision record deleted"}

# Annual Installments APIs
@api_router.get("/installments", response_model=List[InstallmentRecord])
async def get_installment_records():
    records = await db.installments.find().to_list(1000)
    return [InstallmentRecord(**{**record, "_id": str(record["_id"]) if "_id" in record else record.get("id", str(uuid.uuid4()))}) for record in records]

@api_router.post("/installments", response_model=InstallmentRecord)
async def create_installment_record(record: InstallmentRecord):
    # Auto-calculate totals
    record.totalReceived = (record.firstInstallment + record.secondInstallment + 
                           record.thirdInstallment + record.fourthInstallment + 
                           record.fifthInstallment + record.sixthInstallment)
    record.remaining = record.annualAmount - record.totalReceived
    record_dict = record.dict()
    result = await db.installments.insert_one(record_dict)
    return record

@api_router.put("/installments/{record_id}", response_model=InstallmentRecord)
async def update_installment_record(record_id: str, record: InstallmentRecord):
    # Auto-calculate totals
    record.totalReceived = (record.firstInstallment + record.secondInstallment + 
                           record.thirdInstallment + record.fourthInstallment + 
                           record.fifthInstallment + record.sixthInstallment)
    record.remaining = record.annualAmount - record.totalReceived
    record_dict = record.dict()
    await db.installments.update_one({"id": record_id}, {"$set": record_dict})
    return record

@api_router.delete("/installments/{record_id}")
async def delete_installment_record(record_id: str):
    await db.installments.delete_one({"id": record_id})
    return {"message": "Installment record deleted"}

# Monthly Expenses APIs
@api_router.get("/monthly-expenses", response_model=List[MonthlyExpenseRecord])
async def get_monthly_expense_records():
    records = await db.monthly_expenses.find().to_list(1000)
    return [MonthlyExpenseRecord(**{**record, "_id": str(record["_id"]) if "_id" in record else record.get("id", str(uuid.uuid4()))}) for record in records]

@api_router.post("/monthly-expenses", response_model=MonthlyExpenseRecord)
async def create_monthly_expense_record(record: MonthlyExpenseRecord):
    # Auto-calculate total
    record.total = (record.staffSalary + record.expenses + record.buildingRent + 
                   record.dramaFee + record.socialSupport + record.electricity)
    record_dict = record.dict()
    result = await db.monthly_expenses.insert_one(record_dict)
    return record

@api_router.put("/monthly-expenses/{record_id}", response_model=MonthlyExpenseRecord)
async def update_monthly_expense_record(record_id: str, record: MonthlyExpenseRecord):
    # Auto-calculate total
    record.total = (record.staffSalary + record.expenses + record.buildingRent + 
                   record.dramaFee + record.socialSupport + record.electricity)
    record_dict = record.dict()
    await db.monthly_expenses.update_one({"id": record_id}, {"$set": record_dict})
    return record

@api_router.delete("/monthly-expenses/{record_id}")
async def delete_monthly_expense_record(record_id: str):
    await db.monthly_expenses.delete_one({"id": record_id})
    return {"message": "Monthly expense record deleted"}

# Daily Accounts APIs
@api_router.get("/daily-accounts", response_model=List[DailyAccountRecord])
async def get_daily_account_records():
    records = await db.daily_accounts.find().to_list(1000)
    return [DailyAccountRecord(**{**record, "_id": str(record["_id"]) if "_id" in record else record.get("id", str(uuid.uuid4()))}) for record in records]

@api_router.post("/daily-accounts", response_model=DailyAccountRecord)
async def create_daily_account_record(record: DailyAccountRecord):
    record_dict = record.dict()
    result = await db.daily_accounts.insert_one(record_dict)
    return record

@api_router.put("/daily-accounts/{record_id}", response_model=DailyAccountRecord)
async def update_daily_account_record(record_id: str, record: DailyAccountRecord):
    record_dict = record.dict()
    await db.daily_accounts.update_one({"id": record_id}, {"$set": record_dict})
    return record

@api_router.delete("/daily-accounts/{record_id}")
async def delete_daily_account_record(record_id: str):
    await db.daily_accounts.delete_one({"id": record_id})
    return {"message": "Daily account record deleted"}

# Legend APIs
@api_router.get("/legend", response_model=List[LegendEntry])
async def get_legend_entries():
    entries = await db.legend.find().to_list(1000)
    return [LegendEntry(**{**entry, "_id": str(entry["_id"]) if "_id" in entry else entry.get("id", str(uuid.uuid4()))}) for entry in entries]

@api_router.post("/legend", response_model=LegendEntry)
async def create_legend_entry(entry: LegendEntry):
    entry_dict = entry.dict()
    result = await db.legend.insert_one(entry_dict)
    return entry

@api_router.put("/legend/{entry_id}", response_model=LegendEntry)
async def update_legend_entry(entry_id: str, entry: LegendEntry):
    entry_dict = entry.dict()
    await db.legend.update_one({"id": entry_id}, {"$set": entry_dict})
    return entry

@api_router.delete("/legend/{entry_id}")
async def delete_legend_entry(entry_id: str):
    await db.legend.delete_one({"id": entry_id})
    return {"message": "Legend entry deleted"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
