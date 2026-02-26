from app.engine.rules.registre_entry_expiry import RegistreEntryExpiryRule
from app.models.request import EvaluationRequest, CompanyContext, RegistreContext

def make_request(registres=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=10,
            has_physical_site=True,
            sector="bureau",
        ),
        risks=[],
        actions=[],
        registres=registres,
    )

def test_pass_no_registre_data():
    rule = RegistreEntryExpiryRule()
    result = rule.evaluate(make_request())
    assert result.passed is True

def test_pass_all_valid():
    rule = RegistreEntryExpiryRule()
    r = RegistreContext(
        required_types=["rup"],
        existing_types=["rup"],
        entries_expiring=0,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is True

def test_fail_expired_entries():
    rule = RegistreEntryExpiryRule()
    r = RegistreContext(
        required_types=["rup"],
        existing_types=["rup"],
        entries_expiring=2,
        entries_expired=3,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is False
    assert result.severity == "warning"
    assert "3 entree" in result.message

def test_pass_with_expiring_only():
    rule = RegistreEntryExpiryRule()
    r = RegistreContext(
        required_types=["rup"],
        existing_types=["rup"],
        entries_expiring=5,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is True
    assert result.severity == "warning"
    assert "5 entree" in result.message

def test_pass_nothing_expiring():
    rule = RegistreEntryExpiryRule()
    r = RegistreContext(
        required_types=["rup", "accidents"],
        existing_types=["rup", "accidents"],
        entries_expiring=0,
        entries_expired=0,
    )
    result = rule.evaluate(make_request(registres=r))
    assert result.passed is True
    assert result.severity == "info"
