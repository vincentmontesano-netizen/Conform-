from datetime import datetime, timezone, timedelta
from app.engine.rules.annual_update import AnnualUpdateRule
from app.models.request import EvaluationRequest, CompanyContext

def make_request(employee_count=5, validated_at=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=employee_count,
            has_physical_site=True,
            sector="bureau",
        ),
        risks=[],
        actions=[],
        duerp_last_validated_at=validated_at,
    )

def test_pass_under_11():
    rule = AnnualUpdateRule()
    result = rule.evaluate(make_request(employee_count=5))
    assert result.passed is True

def test_fail_11_plus_no_validation():
    rule = AnnualUpdateRule()
    result = rule.evaluate(make_request(employee_count=15))
    assert result.passed is False
    assert result.severity == "critical"

def test_fail_11_plus_expired():
    old_date = (datetime.now(timezone.utc) - timedelta(days=400)).isoformat()
    rule = AnnualUpdateRule()
    result = rule.evaluate(make_request(employee_count=15, validated_at=old_date))
    assert result.passed is False

def test_pass_11_plus_recent():
    recent_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    rule = AnnualUpdateRule()
    result = rule.evaluate(make_request(employee_count=15, validated_at=recent_date))
    assert result.passed is True

def test_boundary_exactly_11():
    rule = AnnualUpdateRule()
    result = rule.evaluate(make_request(employee_count=11))
    assert result.passed is False  # No validation date, so should fail
