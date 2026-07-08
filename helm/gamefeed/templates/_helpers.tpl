{{- define "gamefeed.name" -}}
gamefeed
{{- end }}

{{- define "gamefeed.labels" -}}
app.kubernetes.io/part-of: gamefeed
app.kubernetes.io/managed-by: Helm
{{- end }}
