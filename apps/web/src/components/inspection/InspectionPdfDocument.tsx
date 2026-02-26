import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { InspectionReadiness, InspectionCheck } from '@conform-plus/shared';

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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  scoreBlock: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
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
  checkRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottom: '1px solid #f3f4f6',
  },
  checkIcon: {
    width: 16,
    fontSize: 10,
    marginRight: 6,
  },
  checkLabel: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  checkDetails: {
    width: 200,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
  },
  pass: { color: '#059669' },
  fail: { color: '#dc2626' },
  warn: { color: '#d97706' },
  deadlineRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottom: '1px solid #f3f4f6',
  },
  deadlineDate: {
    width: 80,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  deadlineModule: {
    width: 70,
    fontSize: 8,
    color: '#6b7280',
  },
  deadlineLabel: {
    flex: 1,
    fontSize: 9,
    color: '#111827',
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
    borderTop: '1px solid #d1d5db',
    paddingTop: 8,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
  signatureLine: {
    borderBottom: '1px dotted #9ca3af',
    height: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#9ca3af',
  },
});

function getScoreColor(score: number) {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function CheckRow({ check }: { check: InspectionCheck }) {
  const iconStyle = check.passed
    ? styles.pass
    : check.severity === 'critical'
      ? styles.fail
      : styles.warn;

  return (
    <View style={styles.checkRow}>
      <Text style={[styles.checkIcon, iconStyle]}>{check.passed ? '\u2713' : '\u2717'}</Text>
      <Text style={styles.checkLabel}>{check.label}</Text>
      <Text style={styles.checkDetails}>{check.details}</Text>
    </View>
  );
}

interface Props {
  data: InspectionReadiness;
  companyName: string;
}

export function InspectionPdfDocument({ data, companyName }: Props) {
  const now = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const modules = [
    { key: 'duerp' as const, label: 'DUERP', poids: '30%' },
    { key: 'registres' as const, label: 'Registres obligatoires', poids: '25%' },
    { key: 'epi' as const, label: 'Equipements de Protection Individuelle', poids: '20%' },
    { key: 'formations' as const, label: 'Formations & Habilitations', poids: '25%' },
  ];

  return (
    <Document>
      {/* Page 1: Cover + Global Score */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Dossier d&apos;Inspection</Text>
          <Text style={styles.subtitle}>{companyName}</Text>
          <Text style={styles.dateStamp}>Genere le {now} — Conform+</Text>
        </View>

        {/* Score overview */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreValue, { color: getScoreColor(data.global_score) }]}>
              {data.global_score}%
            </Text>
            <Text style={styles.scoreLabel}>Score global</Text>
          </View>
          {modules.map((m) => (
            <View key={m.key} style={styles.scoreBlock}>
              <Text
                style={[
                  styles.scoreValue,
                  { fontSize: 16, color: getScoreColor(data.modules[m.key].score) },
                ]}
              >
                {data.modules[m.key].score}%
              </Text>
              <Text style={styles.scoreLabel}>
                {m.label} ({m.poids})
              </Text>
            </View>
          ))}
        </View>

        {/* Module details */}
        {modules.map((m) => (
          <View key={m.key} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {m.label} — {data.modules[m.key].score}%
            </Text>
            {data.modules[m.key].checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          Conform+ — Dossier d&apos;inspection — {companyName} — {now}
        </Text>
      </Page>

      {/* Page 2: Deadlines + Signatures */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Echeances critiques ({data.critical_deadlines.length})
          </Text>
          {data.critical_deadlines.length === 0 ? (
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 4 }}>
              Aucune echeance critique dans les 30 prochains jours.
            </Text>
          ) : (
            data.critical_deadlines.map((d) => (
              <View key={d.id} style={styles.deadlineRow}>
                <Text style={styles.deadlineDate}>
                  {new Date(d.date).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.deadlineModule}>{d.module.toUpperCase()}</Text>
                <Text style={styles.deadlineLabel}>{d.label}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes non resolues ({data.alerts_count})</Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 4 }}>
            {data.alerts_count > 0
              ? `${data.alerts_count} alerte(s) de non-conformite en attente de resolution.`
              : 'Aucune alerte de non-conformite en cours.'}
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Inspecteur / Controleur</Text>
            <View style={styles.signatureLine} />
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>
              Nom : ________________________
            </Text>
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>
              Date : ________________________
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Employeur / Representant</Text>
            <View style={styles.signatureLine} />
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>
              Nom : ________________________
            </Text>
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>
              Date : ________________________
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Conform+ — Dossier d&apos;inspection — {companyName} — {now}
        </Text>
      </Page>
    </Document>
  );
}
