import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  dateStamp: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 8,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 160,
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#111827',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #d1d5db',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  col1: { width: '25%' },
  col2: { width: '30%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  badge: {
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
    color: '#ffffff',
  },
  badgeCritique: { backgroundColor: '#dc2626' },
  badgeEleve: { backgroundColor: '#ea580c' },
  badgeModere: { backgroundColor: '#f59e0b' },
  badgeFaible: { backgroundColor: '#22c55e' },
  rpsTag: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    padding: '1 4',
    borderRadius: 2,
    fontSize: 7,
    marginLeft: 4,
  },
  workUnit: {
    marginBottom: 12,
    borderLeft: '3px solid #2563eb',
    paddingLeft: 8,
  },
  workUnitTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  actionTable: {
    marginTop: 8,
  },
  actionCol1: { width: '30%' },
  actionCol2: { width: '15%' },
  actionCol3: { width: '20%' },
  actionCol4: { width: '15%' },
  actionCol5: { width: '20%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
  signatureBlock: {
    marginTop: 30,
    borderTop: '1px solid #d1d5db',
    paddingTop: 12,
  },
  signatureLine: {
    marginTop: 30,
    borderTop: '1px solid #374151',
    width: 200,
  },
});

const SEVERITY_LABELS: Record<string, string> = {
  faible: 'Faible',
  modere: 'Modere',
  eleve: 'Eleve',
  critique: 'Critique',
};

const PRIORITY_LABELS: Record<string, string> = {
  faible: 'Faible',
  moyenne: 'Moyenne',
  haute: 'Haute',
  urgente: 'Urgente',
};

const STATUS_LABELS: Record<string, string> = {
  a_faire: 'A faire',
  en_cours: 'En cours',
  terminee: 'Terminee',
  annulee: 'Annulee',
};

interface DuerpPdfProps {
  duerp: any;
  company: any;
}

export function DuerpPdfDocument({ duerp, company }: DuerpPdfProps) {
  const now = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const workUnits = duerp.work_units || [];
  const actionPlans = duerp.action_plans || [];
  const allRisks = workUnits.flatMap((wu: any) => wu.risks || []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Document Unique d&apos;Evaluation des Risques Professionnels
          </Text>
          <Text style={styles.subtitle}>DUERP — CONFORM+</Text>
          <Text style={styles.dateStamp}>
            Genere le {now} | Version {duerp.current_version || 1}
          </Text>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Identification de l&apos;entreprise</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Raison sociale :</Text>
            <Text style={styles.value}>{company?.name || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SIRET :</Text>
            <Text style={styles.value}>{company?.siret || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Secteur d&apos;activite :</Text>
            <Text style={styles.value}>{company?.sector || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Effectif :</Text>
            <Text style={styles.value}>
              {company?.employee_count ?? '—'} salarie(s)
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Site physique :</Text>
            <Text style={styles.value}>
              {company?.has_physical_site ? 'Oui' : 'Non'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statut :</Text>
            <Text style={styles.value}>{duerp.status}</Text>
          </View>
        </View>

        {/* Work Units & Risks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Unites de travail et risques identifies ({allRisks.length} risques)
          </Text>

          {workUnits.map((wu: any, i: number) => (
            <View key={wu.id || i} style={styles.workUnit}>
              <Text style={styles.workUnitTitle}>
                {i + 1}. {wu.name}
                {wu.description ? ` — ${wu.description}` : ''}
              </Text>

              {(wu.risks || []).length === 0 ? (
                <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                  Aucun risque identifie
                </Text>
              ) : (
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Categorie</Text>
                    <Text style={styles.col2}>Description</Text>
                    <Text style={styles.col3}>Gravite</Text>
                    <Text style={styles.col4}>Probabilite</Text>
                    <Text style={styles.col5}>RPS</Text>
                  </View>
                  {(wu.risks || []).map((risk: any, j: number) => (
                    <View key={risk.id || j} style={styles.tableRow}>
                      <Text style={styles.col1}>{risk.category}</Text>
                      <Text style={styles.col2}>{risk.description}</Text>
                      <Text style={styles.col3}>
                        {SEVERITY_LABELS[risk.severity] || risk.severity}
                      </Text>
                      <Text style={styles.col4}>
                        {risk.probability}
                      </Text>
                      <Text style={styles.col5}>
                        {risk.is_rps ? 'OUI' : 'Non'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>CONFORM+ — Document confidentiel</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Page 2: Action Plans (PAPRIPACT) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Plan d&apos;actions de prevention (PAPRIPACT) — {actionPlans.length} actions
          </Text>

          {actionPlans.length === 0 ? (
            <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Aucun plan d&apos;actions defini
            </Text>
          ) : (
            <View style={styles.actionTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.actionCol1}>Action</Text>
                <Text style={styles.actionCol2}>Priorite</Text>
                <Text style={styles.actionCol3}>Responsable</Text>
                <Text style={styles.actionCol4}>Echeance</Text>
                <Text style={styles.actionCol5}>Statut</Text>
              </View>
              {actionPlans.map((plan: any, i: number) => (
                <View key={plan.id || i} style={styles.tableRow}>
                  <Text style={styles.actionCol1}>
                    {plan.name}
                    {plan.is_critical ? ' [CRITIQUE]' : ''}
                  </Text>
                  <Text style={styles.actionCol2}>
                    {PRIORITY_LABELS[plan.priority] || plan.priority}
                  </Text>
                  <Text style={styles.actionCol3}>
                    {plan.responsible || '—'}
                  </Text>
                  <Text style={styles.actionCol4}>
                    {plan.deadline
                      ? new Date(plan.deadline).toLocaleDateString('fr-FR')
                      : '—'}
                  </Text>
                  <Text style={styles.actionCol5}>
                    {STATUS_LABELS[plan.status] || plan.status}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Signature Block */}
        <View style={styles.signatureBlock}>
          <Text style={styles.sectionTitle}>4. Validation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date de validation :</Text>
            <Text style={styles.value}>{now}</Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <Text style={{ marginBottom: 4 }}>Signature de l&apos;employeur :</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>CONFORM+ — Document confidentiel</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
