from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import uuid
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
import aiosqlite


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# SQLite Database Configuration
DATABASE_URL = "sqlite+aiosqlite:///./berdoz_management.db"
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Database Models for all 7 tables

# 1. Calendar Management (بەڕێوەبردنی ساڵنامە)
class CalendarModel(Base):
    __tablename__ = "calendar"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    month = Column(String, nullable=False)
    week1_day1 = Column(String, default="")
    week1_day2 = Column(String, default="")
    week1_day3 = Column(String, default="")
    week1_day4 = Column(String, default="")
    week1_day5 = Column(String, default="")
    week2_day1 = Column(String, default="")
    week2_day2 = Column(String, default="")
    week2_day3 = Column(String, default="")
    week2_day4 = Column(String, default="")
    week2_day5 = Column(String, default="")
    week3_day1 = Column(String, default="")
    week3_day2 = Column(String, default="")
    week3_day3 = Column(String, default="")
    week3_day4 = Column(String, default="")
    week3_day5 = Column(String, default="")
    week4_day1 = Column(String, default="")
    week4_day2 = Column(String, default="")
    week4_day3 = Column(String, default="")
    week4_day4 = Column(String, default="")
    week4_day5 = Column(String, default="")

# 2. Staff Records (تۆمارەکانی ستاف)
class StaffModel(Base):
    __tablename__ = "staff"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fullName = Column(String, nullable=False)
    mobile = Column(String)
    address = Column(String)
    gender = Column(String)
    dateOfBirth = Column(String)
    marriage = Column(String, default="")
    certificate = Column(String)
    age = Column(Integer)
    education = Column(String)
    attendance = Column(String)
    date = Column(String)
    department = Column(String)
    pass_grade = Column(String)
    contract = Column(String)

# 3. Payroll Management (لیستی بڕی موچە)
class PayrollModel(Base):
    __tablename__ = "payroll"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employeeName = Column(String, nullable=False)
    salary = Column(Float, default=0)
    absence = Column(Float, default=0)
    deduction = Column(Float, default=0)
    bonus = Column(Float, default=0)
    total = Column(Float, default=0)
    notes = Column(Text, default="")

# 4. Supervision System (چاودێری)
class SupervisionModel(Base):
    __tablename__ = "supervision"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    teacherName = Column(String, default="")
    subject = Column(String, default="")
    teacherDepartment = Column(String, default="")
    teacherGrade = Column(String, default="")
    teacherViolationType = Column(String, default="")
    teacherPunishmentType = Column(String, default="")
    studentName = Column(String, default="")
    studentDepartment = Column(String, default="")
    studentGrade = Column(String, default="")
    studentViolationType = Column(String, default="")
    studentPunishmentType = Column(String, default="")

# 5. Annual Installments (قیستی ساڵانه)
class InstallmentModel(Base):
    __tablename__ = "installments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fullName = Column(String, nullable=False)
    grade = Column(String)
    installmentType = Column(String)
    annualAmount = Column(Float, default=0)
    firstInstallment = Column(Float, default=0)
    secondInstallment = Column(Float, default=0)
    thirdInstallment = Column(Float, default=0)
    fourthInstallment = Column(Float, default=0)
    fifthInstallment = Column(Float, default=0)
    sixthInstallment = Column(Float, default=0)
    totalReceived = Column(Float, default=0)
    remaining = Column(Float, default=0)

# 6. Monthly Expenses (خەرجی مانگانه)
class MonthlyExpenseModel(Base):
    __tablename__ = "monthly_expenses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    year = Column(String, nullable=False)
    month = Column(String, nullable=False)
    staffSalary = Column(Float, default=0)
    expenses = Column(Float, default=0)
    buildingRent = Column(Float, default=0)
    dramaFee = Column(Float, default=0)
    socialSupport = Column(Float, default=0)
    electricity = Column(Float, default=0)
    total = Column(Float, default=0)
    notes = Column(Text, default="")

# 7. Daily Accounts (حساباتی رۆژانه)
class DailyAccountModel(Base):
    __tablename__ = "daily_accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    number = Column(Integer, nullable=False)
    week = Column(String)
    purpose = Column(String)
    checkNumber = Column(String)
    amount = Column(Float, default=0)

# Legend for Calendar
class LegendModel(Base):
    __tablename__ = "legend"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    abbreviation = Column(String, nullable=False)
    full_description = Column(String)
    category = Column(String, default="General")
    usage_count = Column(Integer, default=0)

# Pydantic models for API
class CalendarEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: str
    week1: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])
    week2: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])
    week3: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])
    week4: List[str] = Field(default_factory=lambda: ["", "", "", "", ""])

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

class PayrollRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employeeName: str
    salary: float
    absence: float = 0
    deduction: float = 0
    bonus: float = 0
    total: float = 0
    notes: str = ""

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

class DailyAccountRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    week: str
    purpose: str
    checkNumber: str
    amount: float

class LegendEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    abbreviation: str
    full_description: str
    category: str = "General"
    usage_count: int = 0

# Database session dependency
async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Berdoz Management System API with SQLite"}

# Calendar Management APIs
@api_router.get("/calendar", response_model=List[CalendarEntry])
async def get_calendar_entries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CalendarModel))
    entries = result.scalars().all()
    
    calendar_entries = []
    for entry in entries:
        calendar_entries.append(CalendarEntry(
            id=entry.id,
            month=entry.month,
            week1=[entry.week1_day1, entry.week1_day2, entry.week1_day3, entry.week1_day4, entry.week1_day5],
            week2=[entry.week2_day1, entry.week2_day2, entry.week2_day3, entry.week2_day4, entry.week2_day5],
            week3=[entry.week3_day1, entry.week3_day2, entry.week3_day3, entry.week3_day4, entry.week3_day5],
            week4=[entry.week4_day1, entry.week4_day2, entry.week4_day3, entry.week4_day4, entry.week4_day5]
        ))
    return calendar_entries

@api_router.post("/calendar", response_model=CalendarEntry)
async def create_calendar_entry(entry: CalendarEntry, db: AsyncSession = Depends(get_db)):
    db_entry = CalendarModel(
        id=entry.id,
        month=entry.month,
        week1_day1=entry.week1[0] if len(entry.week1) > 0 else "",
        week1_day2=entry.week1[1] if len(entry.week1) > 1 else "",
        week1_day3=entry.week1[2] if len(entry.week1) > 2 else "",
        week1_day4=entry.week1[3] if len(entry.week1) > 3 else "",
        week1_day5=entry.week1[4] if len(entry.week1) > 4 else "",
        week2_day1=entry.week2[0] if len(entry.week2) > 0 else "",
        week2_day2=entry.week2[1] if len(entry.week2) > 1 else "",
        week2_day3=entry.week2[2] if len(entry.week2) > 2 else "",
        week2_day4=entry.week2[3] if len(entry.week2) > 3 else "",
        week2_day5=entry.week2[4] if len(entry.week2) > 4 else "",
        week3_day1=entry.week3[0] if len(entry.week3) > 0 else "",
        week3_day2=entry.week3[1] if len(entry.week3) > 1 else "",
        week3_day3=entry.week3[2] if len(entry.week3) > 2 else "",
        week3_day4=entry.week3[3] if len(entry.week3) > 3 else "",
        week3_day5=entry.week3[4] if len(entry.week3) > 4 else "",
        week4_day1=entry.week4[0] if len(entry.week4) > 0 else "",
        week4_day2=entry.week4[1] if len(entry.week4) > 1 else "",
        week4_day3=entry.week4[2] if len(entry.week4) > 2 else "",
        week4_day4=entry.week4[3] if len(entry.week4) > 3 else "",
        week4_day5=entry.week4[4] if len(entry.week4) > 4 else ""
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return entry

@api_router.put("/calendar/{entry_id}", response_model=CalendarEntry)
async def update_calendar_entry(entry_id: str, entry: CalendarEntry, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CalendarModel).where(CalendarModel.id == entry_id))
    db_entry = result.scalar_one_or_none()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")
    
    db_entry.month = entry.month
    db_entry.week1_day1 = entry.week1[0] if len(entry.week1) > 0 else ""
    db_entry.week1_day2 = entry.week1[1] if len(entry.week1) > 1 else ""
    db_entry.week1_day3 = entry.week1[2] if len(entry.week1) > 2 else ""
    db_entry.week1_day4 = entry.week1[3] if len(entry.week1) > 3 else ""
    db_entry.week1_day5 = entry.week1[4] if len(entry.week1) > 4 else ""
    db_entry.week2_day1 = entry.week2[0] if len(entry.week2) > 0 else ""
    db_entry.week2_day2 = entry.week2[1] if len(entry.week2) > 1 else ""
    db_entry.week2_day3 = entry.week2[2] if len(entry.week2) > 2 else ""
    db_entry.week2_day4 = entry.week2[3] if len(entry.week2) > 3 else ""
    db_entry.week2_day5 = entry.week2[4] if len(entry.week2) > 4 else ""
    db_entry.week3_day1 = entry.week3[0] if len(entry.week3) > 0 else ""
    db_entry.week3_day2 = entry.week3[1] if len(entry.week3) > 1 else ""
    db_entry.week3_day3 = entry.week3[2] if len(entry.week3) > 2 else ""
    db_entry.week3_day4 = entry.week3[3] if len(entry.week3) > 3 else ""
    db_entry.week3_day5 = entry.week3[4] if len(entry.week3) > 4 else ""
    db_entry.week4_day1 = entry.week4[0] if len(entry.week4) > 0 else ""
    db_entry.week4_day2 = entry.week4[1] if len(entry.week4) > 1 else ""
    db_entry.week4_day3 = entry.week4[2] if len(entry.week4) > 2 else ""
    db_entry.week4_day4 = entry.week4[3] if len(entry.week4) > 3 else ""
    db_entry.week4_day5 = entry.week4[4] if len(entry.week4) > 4 else ""
    
    await db.commit()
    await db.refresh(db_entry)
    return entry

@api_router.delete("/calendar/{entry_id}")
async def delete_calendar_entry(entry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CalendarModel).where(CalendarModel.id == entry_id))
    db_entry = result.scalar_one_or_none()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")
    
    await db.delete(db_entry)
    await db.commit()
    return {"message": "Entry deleted"}

# Staff Records APIs
@api_router.get("/staff", response_model=List[StaffRecord])
async def get_staff_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffModel))
    records = result.scalars().all()
    
    staff_records = []
    for record in records:
        staff_records.append(StaffRecord(
            id=record.id,
            fullName=record.fullName,
            mobile=record.mobile or "",
            address=record.address or "",
            gender=record.gender or "",
            dateOfBirth=record.dateOfBirth or "",
            marriage=record.marriage or "",
            certificate=record.certificate or "",
            age=record.age or 0,
            education=record.education or "",
            attendance=record.attendance or "",
            date=record.date or "",
            department=record.department or "",
            pass_=record.pass_grade or "",
            contract=record.contract or ""
        ))
    return staff_records

@api_router.post("/staff", response_model=StaffRecord)
async def create_staff_record(record: StaffRecord, db: AsyncSession = Depends(get_db)):
    db_record = StaffModel(
        id=record.id,
        fullName=record.fullName,
        mobile=record.mobile,
        address=record.address,
        gender=record.gender,
        dateOfBirth=record.dateOfBirth,
        marriage=record.marriage,
        certificate=record.certificate,
        age=record.age,
        education=record.education,
        attendance=record.attendance,
        date=record.date,
        department=record.department,
        pass_grade=record.pass_,
        contract=record.contract
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.put("/staff/{record_id}", response_model=StaffRecord)
async def update_staff_record(record_id: str, record: StaffRecord, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffModel).where(StaffModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Staff record not found")
    
    db_record.fullName = record.fullName
    db_record.mobile = record.mobile
    db_record.address = record.address
    db_record.gender = record.gender
    db_record.dateOfBirth = record.dateOfBirth
    db_record.marriage = record.marriage
    db_record.certificate = record.certificate
    db_record.age = record.age
    db_record.education = record.education
    db_record.attendance = record.attendance
    db_record.date = record.date
    db_record.department = record.department
    db_record.pass_grade = record.pass_
    db_record.contract = record.contract
    
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.delete("/staff/{record_id}")
async def delete_staff_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffModel).where(StaffModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Staff record not found")
    
    await db.delete(db_record)
    await db.commit()
    return {"message": "Staff record deleted"}

# Payroll Management APIs
@api_router.get("/payroll", response_model=List[PayrollRecord])
async def get_payroll_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PayrollModel))
    records = result.scalars().all()
    
    payroll_records = []
    for record in records:
        payroll_records.append(PayrollRecord(
            id=record.id,
            employeeName=record.employeeName,
            salary=record.salary,
            absence=record.absence,
            deduction=record.deduction,
            bonus=record.bonus,
            total=record.total,
            notes=record.notes or ""
        ))
    return payroll_records

@api_router.post("/payroll", response_model=PayrollRecord)
async def create_payroll_record(record: PayrollRecord, db: AsyncSession = Depends(get_db)):
    # Auto-calculate total
    record.total = record.salary - record.absence - record.deduction + record.bonus
    
    db_record = PayrollModel(
        id=record.id,
        employeeName=record.employeeName,
        salary=record.salary,
        absence=record.absence,
        deduction=record.deduction,
        bonus=record.bonus,
        total=record.total,
        notes=record.notes
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.put("/payroll/{record_id}", response_model=PayrollRecord)
async def update_payroll_record(record_id: str, record: PayrollRecord, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PayrollModel).where(PayrollModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    
    # Auto-calculate total
    record.total = record.salary - record.absence - record.deduction + record.bonus
    
    db_record.employeeName = record.employeeName
    db_record.salary = record.salary
    db_record.absence = record.absence
    db_record.deduction = record.deduction
    db_record.bonus = record.bonus
    db_record.total = record.total
    db_record.notes = record.notes
    
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.delete("/payroll/{record_id}")
async def delete_payroll_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PayrollModel).where(PayrollModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    
    await db.delete(db_record)
    await db.commit()
    return {"message": "Payroll record deleted"}

# Supervision System APIs
@api_router.get("/supervision", response_model=List[SupervisionRecord])
async def get_supervision_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupervisionModel))
    records = result.scalars().all()
    
    supervision_records = []
    for record in records:
        supervision_records.append(SupervisionRecord(
            id=record.id,
            teacherName=record.teacherName or "",
            subject=record.subject or "",
            teacherDepartment=record.teacherDepartment or "",
            teacherGrade=record.teacherGrade or "",
            teacherViolationType=record.teacherViolationType or "",
            teacherPunishmentType=record.teacherPunishmentType or "",
            studentName=record.studentName or "",
            studentDepartment=record.studentDepartment or "",
            studentGrade=record.studentGrade or "",
            studentViolationType=record.studentViolationType or "",
            studentPunishmentType=record.studentPunishmentType or ""
        ))
    return supervision_records

@api_router.post("/supervision", response_model=SupervisionRecord)
async def create_supervision_record(record: SupervisionRecord, db: AsyncSession = Depends(get_db)):
    db_record = SupervisionModel(
        id=record.id,
        teacherName=record.teacherName,
        subject=record.subject,
        teacherDepartment=record.teacherDepartment,
        teacherGrade=record.teacherGrade,
        teacherViolationType=record.teacherViolationType,
        teacherPunishmentType=record.teacherPunishmentType,
        studentName=record.studentName,
        studentDepartment=record.studentDepartment,
        studentGrade=record.studentGrade,
        studentViolationType=record.studentViolationType,
        studentPunishmentType=record.studentPunishmentType
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.put("/supervision/{record_id}", response_model=SupervisionRecord)
async def update_supervision_record(record_id: str, record: SupervisionRecord, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupervisionModel).where(SupervisionModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Supervision record not found")
    
    db_record.teacherName = record.teacherName
    db_record.subject = record.subject
    db_record.teacherDepartment = record.teacherDepartment
    db_record.teacherGrade = record.teacherGrade
    db_record.teacherViolationType = record.teacherViolationType
    db_record.teacherPunishmentType = record.teacherPunishmentType
    db_record.studentName = record.studentName
    db_record.studentDepartment = record.studentDepartment
    db_record.studentGrade = record.studentGrade
    db_record.studentViolationType = record.studentViolationType
    db_record.studentPunishmentType = record.studentPunishmentType
    
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.delete("/supervision/{record_id}")
async def delete_supervision_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupervisionModel).where(SupervisionModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Supervision record not found")
    
    await db.delete(db_record)
    await db.commit()
    return {"message": "Supervision record deleted"}

# Annual Installments APIs
@api_router.get("/installments", response_model=List[InstallmentRecord])
async def get_installment_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InstallmentModel))
    records = result.scalars().all()
    
    installment_records = []
    for record in records:
        installment_records.append(InstallmentRecord(
            id=record.id,
            fullName=record.fullName,
            grade=record.grade or "",
            installmentType=record.installmentType or "",
            annualAmount=record.annualAmount,
            firstInstallment=record.firstInstallment,
            secondInstallment=record.secondInstallment,
            thirdInstallment=record.thirdInstallment,
            fourthInstallment=record.fourthInstallment,
            fifthInstallment=record.fifthInstallment,
            sixthInstallment=record.sixthInstallment,
            totalReceived=record.totalReceived,
            remaining=record.remaining
        ))
    return installment_records

@api_router.post("/installments", response_model=InstallmentRecord)
async def create_installment_record(record: InstallmentRecord, db: AsyncSession = Depends(get_db)):
    # Auto-calculate totals
    record.totalReceived = (record.firstInstallment + record.secondInstallment + 
                           record.thirdInstallment + record.fourthInstallment + 
                           record.fifthInstallment + record.sixthInstallment)
    record.remaining = record.annualAmount - record.totalReceived
    
    db_record = InstallmentModel(
        id=record.id,
        fullName=record.fullName,
        grade=record.grade,
        installmentType=record.installmentType,
        annualAmount=record.annualAmount,
        firstInstallment=record.firstInstallment,
        secondInstallment=record.secondInstallment,
        thirdInstallment=record.thirdInstallment,
        fourthInstallment=record.fourthInstallment,
        fifthInstallment=record.fifthInstallment,
        sixthInstallment=record.sixthInstallment,
        totalReceived=record.totalReceived,
        remaining=record.remaining
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.put("/installments/{record_id}", response_model=InstallmentRecord)
async def update_installment_record(record_id: str, record: InstallmentRecord, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InstallmentModel).where(InstallmentModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Installment record not found")
    
    # Auto-calculate totals
    record.totalReceived = (record.firstInstallment + record.secondInstallment + 
                           record.thirdInstallment + record.fourthInstallment + 
                           record.fifthInstallment + record.sixthInstallment)
    record.remaining = record.annualAmount - record.totalReceived
    
    db_record.fullName = record.fullName
    db_record.grade = record.grade
    db_record.installmentType = record.installmentType
    db_record.annualAmount = record.annualAmount
    db_record.firstInstallment = record.firstInstallment
    db_record.secondInstallment = record.secondInstallment
    db_record.thirdInstallment = record.thirdInstallment
    db_record.fourthInstallment = record.fourthInstallment
    db_record.fifthInstallment = record.fifthInstallment
    db_record.sixthInstallment = record.sixthInstallment
    db_record.totalReceived = record.totalReceived
    db_record.remaining = record.remaining
    
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.delete("/installments/{record_id}")
async def delete_installment_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InstallmentModel).where(InstallmentModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Installment record not found")
    
    await db.delete(db_record)
    await db.commit()
    return {"message": "Installment record deleted"}

# Monthly Expenses APIs
@api_router.get("/monthly-expenses", response_model=List[MonthlyExpenseRecord])
async def get_monthly_expense_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MonthlyExpenseModel))
    records = result.scalars().all()
    
    expense_records = []
    for record in records:
        expense_records.append(MonthlyExpenseRecord(
            id=record.id,
            year=record.year,
            month=record.month,
            staffSalary=record.staffSalary,
            expenses=record.expenses,
            buildingRent=record.buildingRent,
            dramaFee=record.dramaFee,
            socialSupport=record.socialSupport,
            electricity=record.electricity,
            total=record.total,
            notes=record.notes or ""
        ))
    return expense_records

@api_router.post("/monthly-expenses", response_model=MonthlyExpenseRecord)
async def create_monthly_expense_record(record: MonthlyExpenseRecord, db: AsyncSession = Depends(get_db)):
    # Auto-calculate total
    record.total = (record.staffSalary + record.expenses + record.buildingRent + 
                   record.dramaFee + record.socialSupport + record.electricity)
    
    db_record = MonthlyExpenseModel(
        id=record.id,
        year=record.year,
        month=record.month,
        staffSalary=record.staffSalary,
        expenses=record.expenses,
        buildingRent=record.buildingRent,
        dramaFee=record.dramaFee,
        socialSupport=record.socialSupport,
        electricity=record.electricity,
        total=record.total,
        notes=record.notes
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.put("/monthly-expenses/{record_id}", response_model=MonthlyExpenseRecord)
async def update_monthly_expense_record(record_id: str, record: MonthlyExpenseRecord, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MonthlyExpenseModel).where(MonthlyExpenseModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Monthly expense record not found")
    
    # Auto-calculate total
    record.total = (record.staffSalary + record.expenses + record.buildingRent + 
                   record.dramaFee + record.socialSupport + record.electricity)
    
    db_record.year = record.year
    db_record.month = record.month
    db_record.staffSalary = record.staffSalary
    db_record.expenses = record.expenses
    db_record.buildingRent = record.buildingRent
    db_record.dramaFee = record.dramaFee
    db_record.socialSupport = record.socialSupport
    db_record.electricity = record.electricity
    db_record.total = record.total
    db_record.notes = record.notes
    
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.delete("/monthly-expenses/{record_id}")
async def delete_monthly_expense_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MonthlyExpenseModel).where(MonthlyExpenseModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Monthly expense record not found")
    
    await db.delete(db_record)
    await db.commit()
    return {"message": "Monthly expense record deleted"}

# Daily Accounts APIs
@api_router.get("/daily-accounts", response_model=List[DailyAccountRecord])
async def get_daily_account_records(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyAccountModel))
    records = result.scalars().all()
    
    daily_records = []
    for record in records:
        daily_records.append(DailyAccountRecord(
            id=record.id,
            number=record.number,
            week=record.week or "",
            purpose=record.purpose or "",
            checkNumber=record.checkNumber or "",
            amount=record.amount
        ))
    return daily_records

@api_router.post("/daily-accounts", response_model=DailyAccountRecord)
async def create_daily_account_record(record: DailyAccountRecord, db: AsyncSession = Depends(get_db)):
    db_record = DailyAccountModel(
        id=record.id,
        number=record.number,
        week=record.week,
        purpose=record.purpose,
        checkNumber=record.checkNumber,
        amount=record.amount
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.put("/daily-accounts/{record_id}", response_model=DailyAccountRecord)
async def update_daily_account_record(record_id: str, record: DailyAccountRecord, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyAccountModel).where(DailyAccountModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Daily account record not found")
    
    db_record.number = record.number
    db_record.week = record.week
    db_record.purpose = record.purpose
    db_record.checkNumber = record.checkNumber
    db_record.amount = record.amount
    
    await db.commit()
    await db.refresh(db_record)
    return record

@api_router.delete("/daily-accounts/{record_id}")
async def delete_daily_account_record(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyAccountModel).where(DailyAccountModel.id == record_id))
    db_record = result.scalar_one_or_none()
    
    if not db_record:
        raise HTTPException(status_code=404, detail="Daily account record not found")
    
    await db.delete(db_record)
    await db.commit()
    return {"message": "Daily account record deleted"}

# Legend APIs
@api_router.get("/legend", response_model=List[LegendEntry])
async def get_legend_entries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LegendModel))
    entries = result.scalars().all()
    
    legend_entries = []
    for entry in entries:
        legend_entries.append(LegendEntry(
            id=entry.id,
            abbreviation=entry.abbreviation,
            full_description=entry.full_description or "",
            category=entry.category or "General",
            usage_count=entry.usage_count
        ))
    return legend_entries

@api_router.post("/legend", response_model=LegendEntry)
async def create_legend_entry(entry: LegendEntry, db: AsyncSession = Depends(get_db)):
    db_entry = LegendModel(
        id=entry.id,
        abbreviation=entry.abbreviation,
        full_description=entry.full_description,
        category=entry.category,
        usage_count=entry.usage_count
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return entry

@api_router.put("/legend/{entry_id}", response_model=LegendEntry)
async def update_legend_entry(entry_id: str, entry: LegendEntry, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LegendModel).where(LegendModel.id == entry_id))
    db_entry = result.scalar_one_or_none()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Legend entry not found")
    
    db_entry.abbreviation = entry.abbreviation
    db_entry.full_description = entry.full_description
    db_entry.category = entry.category
    db_entry.usage_count = entry.usage_count
    
    await db.commit()
    await db.refresh(db_entry)
    return entry

@api_router.delete("/legend/{entry_id}")
async def delete_legend_entry(entry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LegendModel).where(LegendModel.id == entry_id))
    db_entry = result.scalar_one_or_none()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Legend entry not found")
    
    await db.delete(db_entry)
    await db.commit()
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

# Create tables on startup
@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully")

@app.on_event("shutdown")
async def shutdown_db():
    await engine.dispose()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
