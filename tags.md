---
layout: page
title: Tags
permalink: /tags/
---

{% assign sorted_tags = site.tags | sort %}
<ul>
{% for tag in sorted_tags %}
  <li>
    <h3 id="{{ tag[0] | slugify }}">{{ tag[0] }}</h3>
    <ul>
      {% for post in tag[1] %}
        <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
      {% endfor %}
    </ul>
  </li>
{% endfor %}
</ul>
