# Terraform configuration for KiTS Hub monitoring stack

# Helm provider for monitoring tools
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "45.28.0"

  create_namespace = true

  values = [
    "${file("${path.module}/helm/prometheus-values.yml")}"
  ]

  depends_on = [module.eks]
}

# Helm release for Jaeger
resource "helm_release" "jaeger" {
  name       = "jaeger"
  repository = "https://jaegertracing.github.io/helm-charts"
  chart      = "jaeger"
  namespace  = "monitoring"
  version    = "0.71.0"

  create_namespace = true

  values = [
    "${file("${path.module}/helm/jaeger-values.yml")}"
  ]

  depends_on = [helm_release.prometheus]
}

# Helm release for ELK Stack
resource "helm_release" "elasticsearch" {
  name       = "elasticsearch"
  repository = "https://helm.elastic.co"
  chart      = "elasticsearch"
  namespace  = "logging"
  version    = "8.8.0"

  create_namespace = true

  values = [
    "${file("${path.module}/helm/elasticsearch-values.yml")}"
  ]

  depends_on = [module.eks]
}

resource "helm_release" "kibana" {
  name       = "kibana"
  repository = "https://helm.elastic.co"
  chart      = "kibana"
  namespace  = "logging"
  version    = "8.8.0"

  values = [
    "${file("${path.module}/helm/kibana-values.yml")}"
  ]

  depends_on = [helm_release.elasticsearch]
}

resource "helm_release" "logstash" {
  name       = "logstash"
  repository = "https://helm.elastic.co"
  chart      = "logstash"
  namespace  = "logging"
  version    = "8.8.0"

  values = [
    "${file("${path.module}/helm/logstash-values.yml")}"
  ]

  depends_on = [helm_release.elasticsearch]
}

# Ingress Controller
resource "helm_release" "ingress_nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  version    = "4.7.0"

  create_namespace = true

  values = [
    "${file("${path.module}/helm/ingress-nginx-values.yml")}"
  ]

  depends_on = [module.eks]
}

# Cert-Manager for SSL certificates
resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  namespace  = "cert-manager"
  version    = "v1.13.0"

  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [helm_release.ingress_nginx]
}

# ClusterIssuer for Let's Encrypt
resource "kubernetes_manifest" "letsencrypt_issuer" {
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "ClusterIssuer"
    metadata = {
      name = "letsencrypt-prod"
    }
    spec = {
      acme = {
        server = "https://acme-v02.api.letsencrypt.org/directory"
        email  = "admin@${var.domain_name}"
        privateKeySecretRef = {
          name = "letsencrypt-prod"
        }
        solvers = [
          {
            http01 = {
              ingress = {
                class = "nginx"
              }
            }
          }
        ]
      }
    }
  }

  depends_on = [helm_release.cert_manager]
}

# External DNS for automatic DNS management
resource "helm_release" "external_dns" {
  name       = "external-dns"
  repository = "https://kubernetes-sigs.github.io/external-dns/"
  chart      = "external-dns"
  namespace  = "kube-system"
  version    = "1.13.0"

  set {
    name  = "provider"
    value = "aws"
  }

  set {
    name  = "aws.zoneType"
    value = "public"
  }

  set {
    name  = "txtOwnerId"
    value = "kits-hub-external-dns"
  }

  set {
    name  = "domainFilters[0]"
    value = var.domain_name
  }

  depends_on = [module.eks]
}
