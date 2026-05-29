<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #000; padding: 18px 22px; }

  .header-table { width: 100%; margin-bottom: 12px; }
  .logo-cell { width: 120px; vertical-align: top; }
  .logo-cell img { width: 110px; }
  .title-cell { text-align: center; vertical-align: middle; }
  .page-info { text-align: right; vertical-align: top; font-size: 8px; }

  h1 { font-size: 13px; font-weight: bold; text-align: center; letter-spacing: 0.5px; }
  h2 { font-size: 11px; font-weight: bold; text-align: center; margin-top: 2px; }

  .meta { margin: 10px 0 6px 0; font-size: 9px; }
  .meta table td { padding: 1px 4px; }

  table.bills { width: 100%; border-collapse: collapse; margin-top: 6px; }
  table.bills th {
    background-color: #222;
    color: #fff;
    font-size: 8px;
    font-weight: bold;
    border: 1px solid #000;
    padding: 3px 3px;
    text-align: center;
  }
  table.bills td {
    border: 1px solid #444;
    padding: 3px 3px;
    font-size: 8px;
    text-align: center;
    vertical-align: middle;
  }
  table.bills tr:nth-child(even) td { background-color: #f5f5f5; }

  .footer { margin-top: 30px; }
  .footer-grid { width: 100%; }
  .footer-grid td { padding: 2px 10px; vertical-align: top; width: 50%; font-size: 9px; }
  .footer-line { border-bottom: 1px solid #000; display: inline-block; width: 180px; margin-bottom: 10px; }
  .footer-label { font-weight: bold; margin-bottom: 3px; }
  .sign-line { border-bottom: 1px solid #000; width: 170px; display: inline-block; margin-top: 12px; }
</style>
</head>
<body>

<table class="header-table">
  <tr>
    <td class="logo-cell">
      @if($logoPath && file_exists($logoPath))
        <img src="{{ $logoPath }}" alt="Logo">
      @endif
    </td>
    <td class="title-cell">
      <h1>PROCESVERBAL</h1>
      <h2>{{ $labels['title_sub'] }}</h2>
    </td>
    <td class="page-info">
      {{ $labels['page_header'] }}<br>Page 1 of 1
    </td>
  </tr>
</table>

<div class="meta">
  <table>
    <tr>
      <td><strong>{{ $labels['date_label'] }}</strong></td>
      <td>{{ $generatedAt }}</td>
    </tr>
    <tr>
      <td><strong>{{ $labels['serial_label'] }}</strong></td>
      <td>{{ $serialNumber }}</td>
    </tr>
  </table>
</div>

<table class="bills">
  <thead>
    <tr>
      <th>{{ $labels['col_nr'] }}</th>
      <th>{{ $labels['col_type'] }}</th>
      <th>{{ $labels['col_value'] }}</th>
      <th>{{ $labels['col_bill_no'] }}</th>
      <th>{{ $labels['col_department'] }}</th>
      <th>{{ $labels['col_supplier'] }}</th>
      <th>{{ $labels['col_created_by'] }}</th>
      <th>{{ $labels['col_date'] }}</th>
      <th>{{ $labels['col_step'] }}</th>
      <th>{{ $labels['col_status'] }}</th>
      <th>{{ $labels['col_approved'] }}</th>
      <th>{{ $labels['col_notes'] }}</th>
    </tr>
  </thead>
  <tbody>
    @foreach($bills as $index => $bill)
    <tr>
      <td>{{ $index + 1 }}</td>
      <td>{{ $bill->type ?? '-' }}</td>
      <td>{{ number_format((float)$bill->value, 2) }} &euro;</td>
      <td>{{ $bill->bill_no ?? '-' }}</td>
      <td>{{ $bill->departmentName ? $bill->departmentName->name : '-' }}</td>
      <td>{{ $bill->supplierName ? $bill->supplierName->name : '-' }}</td>
      <td>
        @if($bill->createdBy)
          {{ $bill->createdBy->first_name }} {{ $bill->createdBy->last_name }}
        @else
          -
        @endif
      </td>
      <td>{{ $bill->created_at ? $bill->created_at->format('d.m.Y') : '-' }}</td>
      <td>{{ $bill->step ?? '-' }}</td>
      <td>
        @switch($bill->status)
          @case(1) {{ $labels['status_requested'] }} @break
          @case(2) {{ $labels['status_pending'] }} @break
          @case(3) {{ $labels['status_approved_ceo'] }} @break
          @case(4) {{ $labels['status_canceled'] }} @break
          @case(5) {{ $labels['status_approved'] }} @break
          @case(6) {{ $labels['status_printed'] }} @break
          @case(7) {{ $labels['status_delivered'] }} @break
          @default {{ $bill->status }}
        @endswitch
      </td>
      <td style="font-size:7px; text-align:left; padding:2px 4px;">
        @if($bill->approved_first)
          1: {{ \Carbon\Carbon::parse($bill->approved_first)->format('d.m.Y') }}
          @if($bill->approved_second)<br>@endif
        @endif
        @if($bill->approved_second)
          2: {{ \Carbon\Carbon::parse($bill->approved_second)->format('d.m.Y') }}
        @endif
        @if(!$bill->approved_first && !$bill->approved_second) - @endif
      </td>
      <td style="font-size:7px;">{{ $bill->description ? \Illuminate\Support\Str::limit($bill->description, 30) : '-' }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

<div class="footer">
  <table class="footer-grid">
    <tr>
      <td>
        <div class="footer-label">{{ $labels['rep_finance'] }}</div>
        <div class="footer-line"></div><br>
        <div style="margin-top:8px; font-size:8.5px;">{{ $labels['signature'] }}</div>
        <div class="sign-line"></div>
      </td>
      <td>
        <div class="footer-label">{{ $labels['rep_procurement'] }}</div>
        <div class="footer-line"></div><br>
        <div style="margin-top:8px; font-size:8.5px;">{{ $labels['signature'] }}</div>
        <div class="sign-line"></div>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top:14px;">
        <span style="font-size:8.5px; font-weight:bold;">{{ $labels['received_date'] }}</span>
        <span style="border-bottom:1px solid #000; display:inline-block; width:140px; margin-left:6px;"></span>
      </td>
    </tr>
  </table>
</div>

</body>
</html>
