from pydantic import BaseModel, field_validator
from typing import Literal, Optional


COMPANY_SIZE = Literal[
    "1-10", "11-50", "51-200", "201-500",
    "501-1000", "1001-5000", "5001-10000", "10001+"
]

SERVICES_COMPANIES = {
    "tcs", "infosys", "wipro", "accenture", "cognizant",
    "capgemini", "hcl", "tech mahindra", "mindtree", "mphasis",
    "hexaware", "niit technologies", "l&t infotech",
}


class CareerEntry(BaseModel):
    company: str
    title: str
    start_date: str
    end_date: Optional[str] = None
    duration_months: int
    is_current: bool
    industry: str
    company_size: COMPANY_SIZE
    description: str

    @field_validator("duration_months")
    @classmethod
    def non_negative(cls, v: int) -> int:
        return max(0, v)

    @property
    def is_services_company(self) -> bool:
        return self.company.lower().strip() in SERVICES_COMPANIES

    @property
    def is_product_company(self) -> bool:
        # Heuristic: small-to-mid companies not in services list are likely product
        product_sizes = {"1-10", "11-50", "51-200", "201-500", "501-1000"}
        return (
            self.company_size in product_sizes
            and not self.is_services_company
        )
