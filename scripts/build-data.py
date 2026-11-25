# Builds data/projects.json from the compact table below. Values are APPROXIMATE snapshots (not live GitHub data).
import json
R="""Kubernetes|Graduated|Orchestration|115000|3900|400|kubernetes/kubernetes|https://kubernetes.io|Container orchestration for automating deployment and scaling.
Prometheus|Graduated|Observability|57000|1700|280|prometheus/prometheus|https://prometheus.io|Metrics monitoring and alerting toolkit.
etcd|Graduated|Key-Value Store|48000|900|190|etcd-io/etcd|https://etcd.io|Distributed reliable key-value store.
Istio|Graduated|Service Mesh|36000|1000|300|istio/istio|https://istio.io|Service mesh for traffic, security and observability.
Helm|Graduated|App Definition|27000|1000|170|helm/helm|https://helm.sh|The package manager for Kubernetes.
Envoy|Graduated|Service Proxy|25000|1100|250|envoyproxy/envoy|https://www.envoyproxy.io|Cloud-native high-performance edge and service proxy.
Harbor|Graduated|Registry|24000|400|120|goharbor/harbor|https://goharbor.io|Trusted cloud-native container registry.
Jaeger|Graduated|Observability|21000|400|130|jaegertracing/jaeger|https://www.jaegertracing.io|Distributed tracing platform.
Cilium|Graduated|Networking|20000|900|150|cilium/cilium|https://cilium.io|eBPF-based networking, security and observability.
Vitess|Graduated|Database|19000|500|200|vitessio/vitess|https://vitess.io|Horizontal scaling system for MySQL.
Argo|Graduated|Continuous Delivery|18000|1300|220|argoproj/argo-cd|https://argoproj.github.io|Declarative GitOps continuous delivery.
containerd|Graduated|Runtime|17000|800|190|containerd/containerd|https://containerd.io|Industry-standard container runtime.
TiKV|Graduated|Database|15000|400|120|tikv/tikv|https://tikv.org|Distributed transactional key-value database.
Fluentd|Graduated|Observability|13000|280|120|fluent/fluentd|https://www.fluentd.org|Unified logging layer.
CoreDNS|Graduated|Networking|12500|350|130|coredns/coredns|https://coredns.io|Flexible DNS server and Kubernetes service discovery.
Rook|Graduated|Storage|12000|500|110|rook/rook|https://rook.io|Storage orchestration for Kubernetes.
cert-manager|Graduated|Security|12000|400|120|cert-manager/cert-manager|https://cert-manager.io|Automated X.509 certificate management.
Linkerd|Graduated|Service Mesh|11000|350|300|linkerd/linkerd2|https://linkerd.io|Ultralight security-first service mesh.
Open Policy Agent|Graduated|Security|10500|400|140|open-policy-agent/opa|https://www.openpolicyagent.org|Policy-as-code engine.
Crossplane|Graduated|Orchestration|10000|250|130|crossplane/crossplane|https://www.crossplane.io|Control-plane framework for cloud infrastructure.
KEDA|Graduated|Autoscaling|9000|300|70|kedacore/keda|https://keda.sh|Event-driven autoscaling for Kubernetes.
Falco|Graduated|Security|7500|250|60|falcosecurity/falco|https://falco.org|Cloud-native runtime threat detection.
Flux|Graduated|Continuous Delivery|7000|300|260|fluxcd/flux2|https://fluxcd.io|GitOps toolkit for Kubernetes.
Backstage|Incubating|Platform Engineering|30000|1500|250|backstage/backstage|https://backstage.io|Framework for building developer portals.
Keycloak|Incubating|Security|25000|1300|200|keycloak/keycloak|https://www.keycloak.org|Identity and access management.
Dapr|Incubating|Runtime|24000|700|120|dapr/dapr|https://dapr.io|Portable runtime for distributed applications.
Kubeflow|Incubating|Machine Learning|14000|900|60|kubeflow/kubeflow|https://www.kubeflow.org|Machine learning toolkit for Kubernetes.
Thanos|Incubating|Observability|13000|700|110|thanos-io/thanos|https://thanos.io|Highly available Prometheus with long-term storage.
KubeEdge|Incubating|Edge|7000|400|80|kubeedge/kubeedge|https://kubeedge.io|Edge computing platform built on Kubernetes.
Kyverno|Incubating|Security|6000|300|140|kyverno/kyverno|https://kyverno.io|Kubernetes-native policy management.
Longhorn|Incubating|Storage|6000|200|100|longhorn/longhorn|https://longhorn.io|Distributed block storage for Kubernetes.
Knative|Incubating|Serverless|5500|300|90|knative/serving|https://knative.dev|Serverless workloads on Kubernetes.
Karmada|Incubating|Orchestration|4500|300|60|karmada-io/karmada|https://karmada.io|Multi-cluster Kubernetes management.
Kubescape|Sandbox|Security|10000|200|200|kubescape/kubescape|https://kubescape.io|Kubernetes security posture scanning.
OpenCost|Sandbox|Observability|5500|150|50|opencost/opencost|https://www.opencost.io|Cloud cost monitoring for Kubernetes.
Headlamp|Sandbox|Dashboard|3500|150|100|headlamp-k8s/headlamp|https://headlamp.dev|Extensible Kubernetes web UI.
Inspektor Gadget|Sandbox|Observability|2500|150|80|inspektor-gadget/inspektor-gadget|https://inspektor-gadget.io|eBPF tools for debugging Kubernetes.
Submariner|Sandbox|Networking|2500|100|50|submariner-io/submariner|https://submariner.io|Cross-cluster Kubernetes networking.
Kepler|Sandbox|Observability|1000|100|40|sustainable-computing-io/kepler|https://sustainable-computing.io|Energy consumption metrics for workloads."""
P=[]
for l in R.split("\n"):
    n,m,c,s,u,r,repo,w,d=l.split("|")
    P.append(dict(name=n,maturity=m,category=c,stars=int(s),contributors=int(u),releases=int(r),repo="https://github.com/"+repo,website=w,description=d))
json.dump(dict(meta=dict(version="1.0",updated="2026-11-14",source="Hand-curated approximate snapshot; NOT live GitHub data",verified=False),projects=P),open("data/projects.json","w"),indent=1)
print(len(P),"projects")
