# METRICS.md — Tableau de métriques agrégées

## Pipeline CI/CD

| Métrique | Valeur mesurée |
|---|---|
| Durée totale de la pipeline (test→build→push→deploy) | ~3 min |
| Taille de l'image Docker (multi-stage build) | ~49 Mo |
| Temps du rolling update (`rollout status`) | ~30 s |
| Nombre de pods en charge | 2 replicas |
| Latence p95 de l'API (depuis Grafana) | *(à compléter après screenshot)* |

## Monitoring applicatif

Les métriques sont exposées sur `GET /metrics` au format Prometheus.

### Métriques collectées

| Métrique | Type | Description |
|---|---|---|
| `http_requests_total` | Counter | Nombre total de requêtes HTTP par méthode, route et status |
| `http_request_duration_ms` | Histogram | Durée des requêtes en ms (permet de calculer p95) |
| `process_cpu_user_seconds_total` | Counter | Temps CPU consommé par le process Node.js |
| `process_resident_memory_bytes` | Gauge | Mémoire RAM utilisée par le process |
| `nodejs_eventloop_lag_seconds` | Gauge | Latence de la boucle d'événements Node.js |

### Comment tester l'endpoint /metrics

```bash
curl http://localhost:3000/metrics
```

### Dashboard Grafana

> **Stack de monitoring lancée avec :**
> ```bash
> docker compose up -d
> ```
> - API : http://localhost:3000
> - Prometheus : http://localhost:9090
> - Grafana : http://localhost:3001 (admin / admin)

#### Requêtes PromQL utiles dans Grafana

```promql
# Nombre de requêtes par seconde
rate(http_requests_total[1m])

# Latence p95 (95% des requêtes répondent en moins de X ms)
histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))

# Taux d'erreurs 5xx
rate(http_requests_total{status=~"5.."}[1m])
```

## Screenshot Dashboard Grafana

![image](capture/image%20copy%207.png)
![image](capture/image%20copy%208.png)

## Observations — Scénario adverse (pod tué)

| Observation | Valeur |
|---|---|
| Temps de recréation du pod par Kubernetes | ~15 s |
| Impact sur les requêtes (taux d'erreur) | *(à documenter)* |
| Comportement de l'endpoint /health pendant le redémarrage | *(à documenter)* |
